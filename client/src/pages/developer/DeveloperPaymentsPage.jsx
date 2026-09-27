import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Search,
  CheckCircle2,
  XCircle,
  Undo2,
  Clock,
  RotateCcw,
  AlertCircle,
  FileText,
  X
} from 'lucide-react';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';

export function DeveloperPaymentsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialFilter = searchParams.get('status') || 'All';

  const [payments, setPayments] = useState([]);
  const [filter, setFilter] = useState(initialFilter);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals state
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [refundModalOpen, setRefundModalOpen] = useState(false);

  // Form inputs for modals
  const [approvalNotes, setApprovalNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('Transaction ID not found in bank statement');
  const [rejectionNotes, setRejectionNotes] = useState('');
  const [refundStatus, setRefundStatus] = useState('Completed');
  const [refundTxId, setRefundTxId] = useState('');
  const [refundNotes, setRefundNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const toast = useToast();

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.getAllPayments({
        status: filter !== 'All' ? filter : undefined,
        search: search.trim() || undefined,
      });
      if (res && res.payments) {
        setPayments(res.payments);
      }
    } catch (err) {
      console.error('Failed to load payments:', err);
      toast.error('Failed to load payment records.');
    } finally {
      setLoading(false);
    }
  }, [filter, search, toast]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleFilterChange = (status) => {
    setFilter(status);
    setSearchParams(status !== 'All' ? { status } : {});
  };

  // 1. APPROVE ACTION
  const handleApprove = async () => {
    if (!selectedPayment) return;
    try {
      setActionLoading(true);
      const res = await api.approvePayment(selectedPayment._id, approvalNotes);
      toast.success(res.message || 'Payment approved! Subscription activated.');
      setApprovalModalOpen(false);
      setSelectedPayment(null);
      setApprovalNotes('');
      fetchPayments();
    } catch (err) {
      toast.error(err.message || 'Failed to approve payment.');
    } finally {
      setActionLoading(false);
    }
  };

  // 2. REJECT ACTION
  const handleReject = async () => {
    if (!selectedPayment) return;
    try {
      setActionLoading(true);
      const res = await api.rejectPayment(selectedPayment._id, rejectionReason, rejectionNotes);
      toast.warning(res.message || 'Payment rejected. Refund workflow initiated.');
      setRejectionModalOpen(false);
      setSelectedPayment(null);
      setRejectionReason('Transaction ID not found in bank statement');
      setRejectionNotes('');
      fetchPayments();
    } catch (err) {
      toast.error(err.message || 'Failed to reject payment.');
    } finally {
      setActionLoading(false);
    }
  };

  // 3. REFUND WORKFLOW UPDATE
  const handleProcessRefund = async () => {
    if (!selectedPayment) return;
    try {
      setActionLoading(true);
      const res = await api.processRefund(selectedPayment._id, {
        refundStatus,
        refundTransactionId: refundTxId.trim(),
        refundNotes: refundNotes.trim(),
      });
      toast.success(res.message || 'Refund record updated successfully.');
      setRefundModalOpen(false);
      setSelectedPayment(null);
      setRefundTxId('');
      setRefundNotes('');
      fetchPayments();
    } catch (err) {
      toast.error(err.message || 'Failed to update refund status.');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Approved
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-950 text-amber-300 border border-amber-500/40">
            <Clock className="w-3 h-3 text-amber-400" /> Pending
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-950 text-rose-300 border border-rose-500/40">
            <XCircle className="w-3 h-3 text-rose-400" /> Rejected
          </span>
        );
      case 'Refunded':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-950 text-purple-300 border border-purple-500/40">
            <Undo2 className="w-3 h-3 text-purple-400" /> Refunded
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300">
            {status}
          </span>
        );
    }
  };

  // Users modal state
  const [usersModalOpen, setUsersModalOpen] = useState(false);
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

  const handleOpenUsersModal = async () => {
    try {
      setUsersLoading(true);
      setUsersModalOpen(true);
      const res = await api.getAllUsers();
      if (res && res.users) {
        setRegisteredUsers(res.users);
      }
    } catch {
      toast.error('Failed to load registered users.');
    } finally {
      setUsersLoading(false);
    }
  };

  const handleExportCsv = () => {
    if (payments.length === 0) {
      toast.info('No payment records to export.');
      return;
    }
    const headers = ['User', 'Email', 'Amount', 'TransactionID', 'Method', 'Date', 'Status', 'RefundStatus'];
    const rows = payments.map(p => [
      `"${p.userName || ''}"`,
      `"${p.userEmail || ''}"`,
      p.amount || 1,
      `"${p.transactionId || ''}"`,
      p.paymentMethod || 'upi',
      `"${p.createdAt ? new Date(p.createdAt).toISOString() : ''}"`,
      `"${p.status || ''}"`,
      `"${p.refundStatus || 'None'}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `type-speed-payments-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Payments exported to CSV!');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-8 rounded-3xl bg-slate-950 border border-amber-500/40 shadow-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-amber-400" />
            <h1 className="text-2xl sm:text-3xl font-black text-white font-mono">
              DEVELOPER PAYMENT CONSOLE
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Verify transaction IDs, approve subscriptions, or initiate audited refunds.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 hover:text-white transition-colors text-xs font-semibold flex items-center gap-1.5"
            title="Download CSV spreadsheet"
          >
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleOpenUsersModal}
            className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/40 hover:text-amber-200 transition-colors text-xs font-semibold flex items-center gap-1.5"
          >
            <span>View All Users</span>
          </button>

          <button
            onClick={fetchPayments}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 hover:text-white transition-colors flex items-center gap-2 text-xs font-semibold"
            title="Refresh List"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="p-4 rounded-2xl glass-panel border flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {['All', 'Pending', 'Approved', 'Rejected', 'Refunded'].map((st) => (
            <button
              key={st}
              onClick={() => handleFilterChange(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filter === st
                  ? 'bg-amber-400 text-slate-950 shadow-md font-mono'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search email, name, or UTR..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* Payments Table */}
      <div className="rounded-3xl glass-panel border shadow-2xl overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
            <p className="text-xs text-slate-400">Loading transactions...</p>
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-300 font-semibold text-sm">No payment records found</p>
            <p className="text-xs text-slate-500 mt-1">
              Try adjusting the filter or search criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-3">Amount</th>
                  <th className="py-3.5 px-3">Transaction / UTR</th>
                  <th className="py-3.5 px-3">Method</th>
                  <th className="py-3.5 px-3">Submitted</th>
                  <th className="py-3.5 px-3">Status</th>
                  <th className="py-3.5 px-3">Refund State</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono">
                {payments.map((p) => (
                  <tr key={p._id || p.transactionId} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-3.5 px-4 font-sans">
                      <div className="font-bold text-white text-xs">{p.userName}</div>
                      <div className="text-[11px] text-slate-400">{p.userEmail}</div>
                    </td>

                    <td className="py-3.5 px-3 font-bold text-amber-400 text-sm">
                      ₹{p.amount || 1}
                    </td>

                    <td className="py-3.5 px-3 text-slate-200">
                      <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-xs">
                        {p.transactionId}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 uppercase text-[10px] text-slate-400 font-sans">
                      {p.paymentMethod === 'qr_code' ? 'QR Code' : 'UPI ID'}
                    </td>

                    <td className="py-3.5 px-3 text-slate-400 font-sans text-[11px]">
                      {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'N/A'}
                    </td>

                    <td className="py-3.5 px-3 font-sans">
                      {getStatusBadge(p.status)}
                    </td>

                    <td className="py-3.5 px-3 font-sans text-[11px]">
                      <span className={`font-semibold ${
                        p.refundStatus === 'Completed'
                          ? 'text-purple-400'
                          : p.refundStatus === 'Initiated'
                          ? 'text-amber-400'
                          : 'text-slate-500'
                      }`}>
                        {p.refundStatus || 'None'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right font-sans">
                      <div className="flex items-center justify-end gap-1.5">
                        {p.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedPayment(p);
                                setApprovalModalOpen(true);
                              }}
                              className="px-2.5 py-1 rounded-lg font-bold text-white bg-emerald-600 hover:bg-emerald-500 text-[11px] shadow-sm flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3 h-3" /> APPROVE
                            </button>
                            <button
                              onClick={() => {
                                setSelectedPayment(p);
                                setRejectionModalOpen(true);
                              }}
                              className="px-2.5 py-1 rounded-lg font-bold text-white bg-rose-600 hover:bg-rose-500 text-[11px] shadow-sm flex items-center gap-1"
                            >
                              <XCircle className="w-3 h-3" /> REJECT
                            </button>
                          </>
                        )}

                        {p.status === 'Rejected' && p.refundStatus !== 'Completed' && (
                          <button
                            onClick={() => {
                              setSelectedPayment(p);
                              setRefundStatus('Completed');
                              setRefundModalOpen(true);
                            }}
                            className="px-2.5 py-1 rounded-lg font-bold text-white bg-purple-600 hover:bg-purple-500 text-[11px] shadow-sm flex items-center gap-1"
                          >
                            <Undo2 className="w-3 h-3" /> REFUND
                          </button>
                        )}

                        {p.status === 'Approved' && (
                          <span className="text-[11px] text-emerald-400 font-semibold">Active</span>
                        )}
                        {p.refundStatus === 'Completed' && (
                          <span className="text-[11px] text-purple-400 font-semibold">Refund Done</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ----------------- MODAL: APPROVE PAYMENT ----------------- */}
      <AnimatePresence>
        {approvalModalOpen && selectedPayment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md p-6 rounded-3xl glass-panel border border-emerald-500/40 shadow-2xl relative"
            >
              <button
                onClick={() => setApprovalModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Approve ₹1 Subscription</h3>
                  <p className="text-xs text-slate-400">Verifying {selectedPayment.userName}</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono space-y-1 mb-4">
                <div>UTR: <strong className="text-sky-400">{selectedPayment.transactionId}</strong></div>
                <div>Amount: <strong className="text-white">₹{selectedPayment.amount}</strong></div>
                <div>Email: <strong className="text-slate-300">{selectedPayment.userEmail}</strong></div>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-300">
                  Approval Notes (Optional):
                </label>
                <input
                  type="text"
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  placeholder="e.g. Verified against bank statement"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="mt-6 flex gap-2">
                <button
                  type="button"
                  onClick={() => setApprovalModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleApprove}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 flex items-center justify-center gap-1 shadow-lg"
                >
                  {actionLoading ? 'Approving...' : 'CONFIRM APPROVE'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ----------------- MODAL: REJECT PAYMENT ----------------- */}
      <AnimatePresence>
        {rejectionModalOpen && selectedPayment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md p-6 rounded-3xl glass-panel border border-rose-500/40 shadow-2xl relative"
            >
              <button
                onClick={() => setRejectionModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400">
                  <XCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Reject Payment Submission</h3>
                  <p className="text-xs text-slate-400">Initiates refund tracking workflow</p>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Rejection Reason:
                  </label>
                  <select
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-rose-400"
                  >
                    <option value="Transaction ID not found in bank statement">
                      Transaction ID not found in bank statement
                    </option>
                    <option value="Amount mismatch (less than ₹1)">
                      Amount mismatch (less than ₹1)
                    </option>
                    <option value="Duplicate transaction reference">
                      Duplicate transaction reference
                    </option>
                    <option value="Incomplete or forged payment screenshot">
                      Incomplete or invalid payment verification
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Internal Developer Notes:
                  </label>
                  <input
                    type="text"
                    value={rejectionNotes}
                    onChange={(e) => setRejectionNotes(e.target.value)}
                    placeholder="Details for refund audit..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-rose-400"
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-2">
                <button
                  type="button"
                  onClick={() => setRejectionModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleReject}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 flex items-center justify-center gap-1 shadow-lg"
                >
                  {actionLoading ? 'Rejecting...' : 'CONFIRM REJECT'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ----------------- MODAL: PROCESS REFUND ----------------- */}
      <AnimatePresence>
        {refundModalOpen && selectedPayment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md p-6 rounded-3xl glass-panel border border-purple-500/40 shadow-2xl relative"
            >
              <button
                onClick={() => setRefundModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400">
                  <Undo2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Process Refund Audit</h3>
                  <p className="text-xs text-slate-400">Record genuine bank/UPI refund state</p>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Refund Status:
                  </label>
                  <select
                    value={refundStatus}
                    onChange={(e) => setRefundStatus(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-purple-400"
                  >
                    <option value="Completed">Completed (Refund successfully transferred)</option>
                    <option value="Initiated">Initiated (Pending bank processing)</option>
                    <option value="Failed">Failed (Account invalid or bank reversal error)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Refund Bank Reference / UTR:
                  </label>
                  <input
                    type="text"
                    value={refundTxId}
                    onChange={(e) => setRefundTxId(e.target.value)}
                    placeholder="e.g. REF_9823719827"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono focus:outline-none focus:border-purple-400"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Refund Notes:
                  </label>
                  <input
                    type="text"
                    value={refundNotes}
                    onChange={(e) => setRefundNotes(e.target.value)}
                    placeholder="e.g. ₹1 refunded via source UPI handle"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-2">
                <button
                  type="button"
                  onClick={() => setRefundModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleProcessRefund}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 flex items-center justify-center gap-1 shadow-lg"
                >
                  {actionLoading ? 'Updating...' : 'RECORD REFUND'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ----------------- MODAL: REGISTERED USERS ----------------- */}
      <AnimatePresence>
        {usersModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-3xl p-6 sm:p-8 rounded-3xl glass-panel border border-amber-500/40 shadow-2xl relative max-h-[85vh] flex flex-col"
            >
              <button
                onClick={() => setUsersModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white font-mono">Registered Typists &amp; Users</h3>
                  <p className="text-xs text-slate-400">Total registered community members: {registeredUsers.length}</p>
                </div>
              </div>

              {usersLoading ? (
                <div className="py-16 text-center text-xs text-slate-400">Loading user registry...</div>
              ) : (
                <div className="overflow-y-auto flex-1 border border-slate-800 rounded-2xl">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 font-sans">
                      <tr>
                        <th className="py-3 px-4">Name</th>
                        <th className="py-3 px-3">Email</th>
                        <th className="py-3 px-3">Role</th>
                        <th className="py-3 px-3">Subscription</th>
                        <th className="py-3 px-3">Best WPM</th>
                        <th className="py-3 px-4 text-right">Joined</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {registeredUsers.map((u) => (
                        <tr key={u._id || u.email} className="hover:bg-slate-900/50">
                          <td className="py-3 px-4 font-sans font-bold text-white">{u.name}</td>
                          <td className="py-3 px-3 text-slate-300">{u.email}</td>
                          <td className="py-3 px-3 uppercase text-[10px] text-amber-400 font-bold">{u.role}</td>
                          <td className="py-3 px-3 font-sans">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              u.subscriptionStatus === 'active'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                                : u.subscriptionStatus === 'pending'
                                ? 'bg-sky-950 text-sky-300 border border-sky-500/40'
                                : 'bg-slate-800 text-slate-400'
                            }`}>
                              {u.subscriptionStatus}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-bold text-sky-400">
                            {u.typingStatistics?.bestWpm || 0}
                          </td>
                          <td className="py-3 px-4 text-right text-slate-500 font-sans">
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setUsersModalOpen(false)}
                  className="px-5 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
