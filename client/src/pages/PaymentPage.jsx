import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  QrCode,
  Copy,
  Check,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  Info,
  CreditCard,
  Crown
} from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export function PaymentPage() {
  const { user, refreshProfile } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [paymentConfig, setPaymentConfig] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState('qr_code'); // 'qr_code' | 'upi'
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Form fields
  const [transactionId, setTransactionId] = useState('');
  const [userUpiId, setUserUpiId] = useState('');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Fetch payment configuration & QR code from backend
  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await api.getPaymentConfig();
        if (res && res.config) {
          setPaymentConfig(res.config);
        }
      } catch (err) {
        console.error('Failed to load payment config:', err);
      }
    }
    loadConfig();
  }, []);

  const handleCopyUpi = () => {
    if (paymentConfig?.upiId) {
      navigator.clipboard.writeText(paymentConfig.upiId);
      setCopiedUpi(true);
      toast.success('UPI ID copied to clipboard!');
      setTimeout(() => setCopiedUpi(false), 2000);
    }
  };

  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    setError('');

    if (!transactionId.trim()) {
      setError('Transaction ID / UTR number is required for verification.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.submitPayment({
        transactionId: transactionId.trim(),
        paymentMethod: selectedMethod,
        userUpiId: userUpiId.trim(),
        remarks: remarks.trim(),
      });

      toast.success(res.message || 'Payment submitted for verification!');
      await refreshProfile();
      navigate('/payments');
    } catch (err) {
      setError(err.message || 'Payment submission failed. Please verify your transaction details.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-wider mb-3 border border-amber-500/30">
          <Crown className="w-3.5 h-3.5 fill-amber-300" />
          ₹1 Subscription Checkout
        </div>
        <h1 className="text-3xl font-black text-white">Complete Your ₹1 Payment</h1>
        <p className="text-sm text-slate-400 mt-1">
          Pay ₹1 via UPI or QR Code and submit your Transaction ID / UTR for developer verification.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Column: Payment Methods (QR Code & UPI ID) */}
        <div className="md:col-span-6 space-y-6">
          <div className="p-6 rounded-3xl glass-panel border shadow-xl">
            <h2 className="text-base font-bold text-white mb-4 flex items-center justify-between">
              <span>Choose Payment Method</span>
              <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
                Amount: ₹1
              </span>
            </h2>

            {/* Method Tabs */}
            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-900 border border-slate-800 mb-6">
              <button
                type="button"
                onClick={() => setSelectedMethod('qr_code')}
                className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  selectedMethod === 'qr_code'
                    ? 'bg-sky-500 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <QrCode className="w-4 h-4" /> QR Code
              </button>
              <button
                type="button"
                onClick={() => setSelectedMethod('upi')}
                className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  selectedMethod === 'upi'
                    ? 'bg-sky-500 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <CreditCard className="w-4 h-4" /> UPI ID
              </button>
            </div>

            {/* Method 1: QR Code */}
            {selectedMethod === 'qr_code' && (
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-4 rounded-2xl bg-white shadow-2xl border-4 border-slate-800 relative">
                  {paymentConfig?.qrDataUrl ? (
                    <img
                      src={paymentConfig.qrDataUrl}
                      alt="Payment QR Code for ₹1"
                      className="w-56 h-56 object-contain"
                    />
                  ) : (
                    <div className="w-56 h-56 flex items-center justify-center bg-slate-100 text-slate-400 text-xs">
                      Loading QR...
                    </div>
                  )}
                  <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-bold tracking-widest uppercase border border-slate-700">
                    SCAN &amp; PAY
                  </span>
                </div>

                <div className="pt-2">
                  <p className="text-xs font-bold text-white">Scan using Any UPI App</p>
                  <p className="text-[11px] text-slate-400">
                    Google Pay, PhonePe, Paytm, CRED, or BHIM
                  </p>
                </div>
              </div>
            )}

            {/* Method 2: UPI ID */}
            {selectedMethod === 'upi' && (
              <div className="space-y-4 py-2">
                <p className="text-xs text-slate-300">
                  Transfer ₹1 directly to our official company UPI ID:
                </p>

                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-700/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                      Official UPI ID
                    </span>
                    <p className="font-mono text-sm sm:text-base font-bold text-sky-400">
                      {paymentConfig?.upiId || 'typespeed@upi'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyUpi}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors flex items-center gap-1 text-xs font-semibold"
                  >
                    {copiedUpi ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedUpi ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-sky-950/40 border border-sky-500/30 text-xs text-sky-300 flex items-start gap-2">
                  <Info className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>After sending ₹1 from your bank or UPI app, copy the 12-digit UTR / Transaction ID and enter it in the form.</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Transaction Submission Form */}
        <div className="md:col-span-6 space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-6 sm:p-8 rounded-3xl glass-panel border shadow-xl"
          >
            <h2 className="text-base font-bold text-white mb-2">Submit Payment Confirmation</h2>
            <p className="text-xs text-slate-400 mb-6">
              Enter your transaction details. The developer will review and activate your subscription.
            </p>

            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmitPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Transaction ID / UTR Number <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="e.g. 428938192837 or TXN_987123"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white font-mono text-sm uppercase placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Find this 12-digit number in your UPI app receipt
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Your UPI ID (Optional)
                </label>
                <input
                  type="text"
                  value={userUpiId}
                  onChange={(e) => setUserUpiId(e.target.value)}
                  placeholder="username@okhdfcbank"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white font-mono text-sm placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Notes / Remarks (Optional)
                </label>
                <textarea
                  rows="2"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Add any additional details or notes"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Strict Notice regarding Developer Approval Workflow */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-slate-300">
                  <ShieldCheck className="w-4 h-4 text-sky-400" />
                  <span>Important Payment Policy</span>
                </div>
                <p>
                  Payments are not marked as completed automatically upon button click. All submissions undergo backend verification by the developer before subscription activation.
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 px-4 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 shadow-xl shadow-amber-500/20 disabled:opacity-60 text-sm flex items-center justify-center gap-2 uppercase tracking-wider font-mono"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                ) : (
                  <>
                    SUBMIT PAYMENT FOR VERIFICATION <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
