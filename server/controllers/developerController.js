import { Payment, User, TypingResult } from '../models/dbStore.js';
import { PAYMENT_STATUS, REFUND_STATUS, SUBSCRIPTION_STATUS } from '../config/constants.js';

/**
 * Developer Overview Statistics
 */
export async function getDeveloperStats(req, res) {
  try {
    const allPayments = await Payment.find({});
    const totalUsers = await User.countDocuments({});
    const totalTests = await TypingResult.countDocuments({});

    const pendingCount = allPayments.filter(p => p.status === PAYMENT_STATUS.PENDING).length;
    const approvedCount = allPayments.filter(p => p.status === PAYMENT_STATUS.APPROVED).length;
    const rejectedCount = allPayments.filter(p => p.status === PAYMENT_STATUS.REJECTED).length;
    const refundedCount = allPayments.filter(p => p.status === PAYMENT_STATUS.REFUNDED || p.refundStatus === REFUND_STATUS.COMPLETED).length;

    const totalRevenue = allPayments
      .filter(p => p.status === PAYMENT_STATUS.APPROVED)
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    return res.status(200).json({
      success: true,
      stats: {
        totalPayments: allPayments.length,
        pendingApprovals: pendingCount,
        approvedPayments: approvedCount,
        rejectedPayments: rejectedCount,
        refundedPayments: refundedCount,
        totalRevenue,
        totalUsers,
        totalTests
      }
    });
  } catch (error) {
    console.error('getDeveloperStats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to load developer statistics.'
    });
  }
}

/**
 * Get all payments with optional status filtering and search query
 */
export async function getAllPayments(req, res) {
  try {
    const { status, search } = req.query;
    let payments = await Payment.find({});

    // Filter by status if provided and not 'All'
    if (status && status !== 'All') {
      payments = payments.filter(p => p.status.toLowerCase() === status.toLowerCase());
    }

    // Search by email, transactionId, or userName
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      payments = payments.filter(p =>
        (p.userEmail && p.userEmail.toLowerCase().includes(q)) ||
        (p.userName && p.userName.toLowerCase().includes(q)) ||
        (p.transactionId && p.transactionId.toLowerCase().includes(q))
      );
    }

    return res.status(200).json({
      success: true,
      count: payments.length,
      payments
    });
  } catch (error) {
    console.error('getAllPayments error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve payment records.'
    });
  }
}

/**
 * Approve a pending payment:
 * 1. Sets payment status to APPROVED
 * 2. Sets user subscription to ACTIVE
 * 3. Records approval timestamp
 */
export async function approvePayment(req, res) {
  try {
    const { id } = req.params;
    const { reviewerNotes } = req.body;

    const payment = await Payment.findById(id);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found.' });
    }

    if (payment.status === PAYMENT_STATUS.APPROVED) {
      return res.status(400).json({
        success: false,
        message: 'This payment has already been approved.'
      });
    }

    const updatedPayment = await Payment.findByIdAndUpdate(id, {
      status: PAYMENT_STATUS.APPROVED,
      approvedAt: new Date(),
      reviewerNotes: reviewerNotes || 'Payment verified and approved by developer.'
    }, { new: true });

    // Activate the user's subscription
    await User.findByIdAndUpdate(payment.userId, {
      subscriptionStatus: SUBSCRIPTION_STATUS.ACTIVE,
      subscriptionExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year access
    });

    return res.status(200).json({
      success: true,
      message: `Payment ${payment.transactionId} approved. User subscription is now active!`,
      payment: updatedPayment
    });
  } catch (error) {
    console.error('approvePayment error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to approve payment. Please try again.'
    });
  }
}

/**
 * Reject a payment:
 * 1. Sets payment status to REJECTED
 * 2. Sets refund status to INITIATED
 * 3. Reverts user subscription to FREE
 * 4. Records rejection timestamp & reason
 */
export async function rejectPayment(req, res) {
  try {
    const { id } = req.params;
    const { reason = 'Transaction verification failed / unverified UTR', notes = '' } = req.body;

    const payment = await Payment.findById(id);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found.' });
    }

    const updatedPayment = await Payment.findByIdAndUpdate(id, {
      status: PAYMENT_STATUS.REJECTED,
      rejectedAt: new Date(),
      refundStatus: REFUND_STATUS.INITIATED,
      refundAmount: payment.amount,
      refundReason: reason,
      refundNotes: notes || 'Refund workflow initiated upon payment rejection.'
    }, { new: true });

    // Ensure user subscription is reverted to free
    await User.findByIdAndUpdate(payment.userId, {
      subscriptionStatus: SUBSCRIPTION_STATUS.FREE
    });

    return res.status(200).json({
      success: true,
      message: `Payment rejected. Refund workflow initiated for ₹${payment.amount}.`,
      payment: updatedPayment
    });
  } catch (error) {
    console.error('rejectPayment error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to reject payment.'
    });
  }
}

/**
 * Process / update refund status
 * Supports: 'Initiated' | 'Completed' | 'Failed'
 */
export async function processRefund(req, res) {
  try {
    const { id } = req.params;
    const { refundStatus, refundTransactionId, refundNotes } = req.body;

    const validStatuses = [REFUND_STATUS.REQUESTED, REFUND_STATUS.INITIATED, REFUND_STATUS.COMPLETED, REFUND_STATUS.FAILED];
    if (!validStatuses.includes(refundStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid refund status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const payment = await Payment.findById(id);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found.' });
    }

    const updateFields = {
      refundStatus,
      refundNotes: refundNotes || payment.refundNotes || ''
    };

    if (refundTransactionId) {
      updateFields.refundTransactionId = refundTransactionId.trim();
    }

    if (refundStatus === REFUND_STATUS.COMPLETED) {
      updateFields.refundedAt = new Date();
      updateFields.status = PAYMENT_STATUS.REFUNDED;
    }

    const updatedPayment = await Payment.findByIdAndUpdate(id, updateFields, { new: true });

    return res.status(200).json({
      success: true,
      message: `Refund status updated to ${refundStatus}.`,
      payment: updatedPayment
    });
  } catch (error) {
    console.error('processRefund error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update refund status.'
    });
  }
}

/**
 * List all registered users (for developer console)
 */
export async function getAllUsers(req, res) {
  try {
    const users = await User.find({});
    const sanitizedUsers = users.map(u => {
      const { passwordHash, resetPasswordToken, resetPasswordExpires, ...sanitized } = u;
      return sanitized;
    });

    return res.status(200).json({
      success: true,
      users: sanitizedUsers
    });
  } catch (error) {
    console.error('getAllUsers error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve users.'
    });
  }
}
