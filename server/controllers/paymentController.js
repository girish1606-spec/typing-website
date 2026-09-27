import { Payment, User } from '../models/dbStore.js';
import { SUBSCRIPTION_PRICE, SUBSCRIPTION_CURRENCY, PAYMENT_STATUS, REFUND_STATUS } from '../config/constants.js';
import { generateQrDataUrl, buildUpiUri } from '../utils/qrGenerator.js';

/**
 * Get payment configuration and dynamic QR code for ₹1 subscription
 */
export async function getPaymentConfig(req, res) {
  try {
    const upiId = process.env.UPI_ID || 'typespeed@upi';
    const merchantName = process.env.UPI_MERCHANT_NAME || 'TYPE SPEED';
    const amount = SUBSCRIPTION_PRICE;
    const currency = SUBSCRIPTION_CURRENCY;
    const note = 'TYPE SPEED Premium Subscription';

    const upiUri = buildUpiUri({
      upiId,
      merchantName,
      amount,
      note
    });

    const qrDataUrl = await generateQrDataUrl(upiUri);

    return res.status(200).json({
      success: true,
      config: {
        upiId,
        merchantName,
        amount,
        currency,
        note,
        upiUri,
        qrDataUrl,
        supportedMethods: ['upi', 'qr_code']
      }
    });
  } catch (error) {
    console.error('getPaymentConfig error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to load payment configuration.'
    });
  }
}

/**
 * Submit payment transaction details for backend developer verification
 */
export async function submitPayment(req, res) {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const { transactionId, paymentMethod = 'upi', userUpiId = '', remarks = '' } = req.body;

    if (!transactionId || typeof transactionId !== 'string' || !transactionId.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Payment information is incomplete. Valid Transaction ID / UTR is required.'
      });
    }

    const cleanTxId = transactionId.trim().toUpperCase();

    // Check if this transaction ID has already been submitted
    const existing = await Payment.findOne({ transactionId: cleanTxId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'This Transaction ID / UTR has already been submitted. Please check your payment history or contact support.'
      });
    }

    // Create payment in Pending status. Never auto-approve on submission!
    const newPayment = await Payment.create({
      userId: String(userId),
      userName: user.name,
      userEmail: user.email,
      amount: SUBSCRIPTION_PRICE,
      currency: SUBSCRIPTION_CURRENCY,
      paymentMethod: paymentMethod === 'qr_code' ? 'qr_code' : 'upi',
      userUpiId: userUpiId.trim(),
      transactionId: cleanTxId,
      status: PAYMENT_STATUS.PENDING,
      refundStatus: REFUND_STATUS.NONE,
      refundAmount: 0,
      reviewerNotes: remarks.trim()
    });

    // Mark user subscription status as pending verification if not already active
    if (user.subscriptionStatus !== 'active') {
      await User.findByIdAndUpdate(userId, { subscriptionStatus: 'pending' });
    }

    return res.status(201).json({
      success: true,
      message: 'Your payment was submitted successfully and is waiting for developer verification.',
      payment: newPayment
    });
  } catch (error) {
    console.error('submitPayment error:', error);
    return res.status(500).json({
      success: false,
      message: 'Payment information is incomplete or could not be processed. Please try again.'
    });
  }
}

/**
 * Get all payment records for current user
 */
export async function getUserPayments(req, res) {
  try {
    const userId = req.user._id;
    const payments = await Payment.find({ userId: String(userId) });
    const user = await User.findById(userId);

    return res.status(200).json({
      success: true,
      payments,
      subscriptionStatus: user ? user.subscriptionStatus : 'free'
    });
  } catch (error) {
    console.error('getUserPayments error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve your payment history.'
    });
  }
}

/**
 * Get a specific payment by ID
 */
export async function getPaymentById(req, res) {
  try {
    const { id } = req.params;
    const payment = await Payment.findById(id);

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found.' });
    }

    // Only allow owner or developer to view
    if (payment.userId !== String(req.user._id) && req.user.role !== 'developer') {
      return res.status(403).json({ success: false, message: 'Unauthorized to view this payment.' });
    }

    return res.status(200).json({
      success: true,
      payment
    });
  } catch (error) {
    console.error('getPaymentById error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to load payment details.'
    });
  }
}
