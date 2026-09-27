import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Receipt,
  RotateCcw,
  CheckCircle2,
  Clock,
  AlertCircle,
  Undo2,
  Crown,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export function UserPaymentsPage() {
  const { user, refreshProfile } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await api.getUserPayments();
      if (res && res.payments) {
        setPayments(res.payments);
      }
      await refreshProfile();
    } catch (err) {
      console.error('Failed to load user payments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Approved
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-950/80 text-amber-300 border border-amber-500/40">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            Pending Verification
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-950/80 text-rose-300 border border-rose-500/40">
            <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
            Rejected
          </span>
        );
      case 'Refunded':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-950/80 text-purple-300 border border-purple-500/40">
            <Undo2 className="w-3.5 h-3.5 text-purple-400" />
            Refunded
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300">
            {status}
          </span>
        );
    }
  };

  const getStatusMessage = (p) => {
    if (p.status === 'Approved') {
      return 'Your payment has been verified. Your subscription has been activated!';
    }
    if (p.status === 'Pending') {
      return 'Your payment is waiting for developer verification.';
    }
    if (p.status === 'Rejected') {
      return `Your payment was rejected (${p.refundReason || 'Verification failed'}) and the amount will be refunded.`;
    }
    if (p.status === 'Refunded' || p.refundStatus === 'Completed') {
      return `Refund of ₹${p.amount} has been processed back to your source account.`;
    }
    return '';
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-8 rounded-3xl glass-panel border shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400">
              <Receipt className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">My Payment History</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Review transaction receipts, developer approval status, and refund tracking.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchPayments}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-semibold"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Refresh Status</span>
          </button>

          <Link
            to="/payment"
            className="px-4 py-2.5 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-xs flex items-center gap-1 shadow-lg shadow-amber-500/20"
          >
            <Crown className="w-3.5 h-3.5" />
            <span>Pay ₹1</span>
          </Link>
        </div>
      </div>

      {/* Payments List */}
      <div className="rounded-3xl glass-panel border shadow-xl p-6 sm:p-8">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-sky-400/30 border-t-sky-400 rounded-full animate-spin" />
            <p className="text-xs text-slate-400">Loading payment records...</p>
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-slate-800 rounded-2xl">
            <Receipt className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-300 font-semibold text-base">No payment submissions found</p>
            <p className="text-xs text-slate-500 mt-1">
              You haven't submitted any ₹1 subscription payments yet.
            </p>
            <Link
              to="/payment"
              className="mt-5 inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-400 text-xs"
            >
              Subscribe for ₹1 Now <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {payments.map((p) => (
              <motion.div
                key={p._id || p.transactionId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col gap-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-black text-white font-mono">
                      ₹{p.amount || 1}
                    </span>
                    <span className="text-xs uppercase font-bold text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      {p.paymentMethod === 'qr_code' ? 'QR Code' : 'UPI ID'}
                    </span>
                  </div>
                  <div>{getStatusBadge(p.status)}</div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
                  <div>
                    <span className="text-slate-500 font-sans block text-[11px] uppercase">
                      Transaction ID / UTR:
                    </span>
                    <span className="font-bold text-slate-200">{p.transactionId}</span>
                  </div>

                  <div>
                    <span className="text-slate-500 font-sans block text-[11px] uppercase">
                      Submitted Date:
                    </span>
                    <span className="text-slate-300 font-sans">
                      {p.createdAt ? new Date(p.createdAt).toLocaleString() : 'N/A'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 font-sans block text-[11px] uppercase">
                      Refund Status:
                    </span>
                    <span className={`font-semibold ${
                      p.refundStatus === 'Completed'
                        ? 'text-purple-400'
                        : p.refundStatus === 'Initiated'
                        ? 'text-amber-400'
                        : 'text-slate-400'
                    }`}>
                      {p.refundStatus || 'None'}
                    </span>
                  </div>
                </div>

                {/* Explanatory Message Box */}
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/60 text-xs text-slate-300 flex items-center gap-2">
                  <span className="font-sans font-semibold text-slate-400">Notice:</span>
                  <span>{getStatusMessage(p)}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
