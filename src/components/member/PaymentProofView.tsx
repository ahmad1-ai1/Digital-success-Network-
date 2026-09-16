```tsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { paymentService } from '../../services';
import { supabase } from '../../lib/supabase';
import {
  Receipt,
  CheckCircle2,
  Clock,
  XCircle,
  Upload,
  AlertTriangle,
  Building,
  CreditCard,
  Send,
  MessageCircle,
  Copy,
  Smartphone
} from 'lucide-react';
import { PayoutMethod } from '../../types';

export const PaymentProofView: React.FC = () => {
  const { user, profile, refreshUser } = useAuth();
  const { success, error } = useToast();

  const [transactionId, setTransactionId] = useState('');
  const [amount, setAmount] = useState<number>(1300);
  const [method, setMethod] = useState<PayoutMethod>('bank_transfer');
  const [senderName, setSenderName] = useState(user?.fullName || '');
  const [senderAccount, setSenderAccount] = useState(user?.phone || '');
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  if (!user || !profile) return null;

  const proofs = paymentService.getProofsByUser(user.id);
  const latestProof = proofs[0];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      const reader = new FileReader();

      reader.onloadend = () => {
        setReceiptImage(reader.result as string);
      };

      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!transactionId.trim() || !senderAccount.trim()) {
      error('Transaction ID and Sender Account details are required.');
      return;
    }

    setLoading(true);

    try {
      // Get the real Supabase Auth user.
      // This ID must match auth.uid() for the payment_proofs RLS policy.
      const {
        data: { user: authUser },
        error: authError
      } = await supabase.auth.getUser();

      if (authError || !authUser) {
        error('Your login session is invalid. Please log in again.');
        return;
      }

      const res = await paymentService.submitProof({
        userId: authUser.id,
        transactionId: transactionId.trim().toUpperCase(),
        amount,
        paymentMethod: method,
        senderName: senderName.trim(),
        senderAccount: senderAccount.trim(),
        receiptUrl:
          receiptImage ||
          'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400',
        notes: notes.trim() || undefined
      });

      if (res.success) {
        success(
          'Payment proof submitted successfully! Pending verification by Central Operations.'
        );

        setTransactionId('');
        setReceiptImage(null);
        setNotes('');

        refreshUser();
      } else {
        error(res.error || 'Failed to submit payment proof.');
      }
    } catch (err) {
      console.error('Payment proof submission error:', err);

      error(
        err instanceof Error
          ? err.message
          : 'Failed to submit payment proof.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 font-display">
          Activation Payment Proof
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Submit your official receipt/transaction details to activate your membership.
        </p>
      </div>

      {/* Account Status Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Account Activation Status
          </span>

          <div className="flex items-center gap-2 mt-1">
            <span
              className={`text-lg font-extrabold capitalize ${
                profile.accountStatus === 'active'
                  ? 'text-emerald-700'
                  : 'text-amber-600'
              }`}
            >
              {profile.accountStatus.replace('_', ' ')}
            </span>
          </div>

          {latestProof && (
            <p className="text-xs text-slate-500 mt-1">
              Latest Submission:{' '}
              <strong className="font-mono">
                {latestProof.transactionId}
              </strong>{' '}
              ({latestProof.status})
            </p>
          )}

          {latestProof?.status === 'rejected' &&
            latestProof.rejectionReason && (
              <p className="text-xs text-rose-600 mt-1 font-semibold">
                Rejection Reason: {latestProof.rejectionReason}
              </p>
            )}
        </div>

        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-slate-50 border border-slate-200">
          {profile.accountStatus === 'active' ? (
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
          ) : latestProof?.status === 'pending' ? (
            <Clock className="w-6 h-6 text-amber-500" />
          ) : (
            <AlertTriangle className="w-6 h-6 text-amber-500" />
          )}
        </div>
      </div>

      {/* Official Receiving Accounts */}
      <div className="p-6 sm:p-8 bg-slate-900 text-white rounded-3xl space-y-6 shadow-md border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider block">
              Official DSN Payment Channels
            </span>

            <h2 className="text-xl font-black mt-1 text-white font-display">
              Transfer 1,300 PKR Joining / Activation Fee
            </h2>

            <p className="text-xs text-slate-400 mt-1">
              Select any of the two official channels below to transfer your 1,300 PKR activation payment:
            </p>
          </div>

          <span className="self-start px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/30">
            Fee: 1,300 PKR
          </span>
        </div>

        {/* TWO Official Payment Methods */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Method 1: Bank Transfer */}
          <div className="p-5 bg-slate-800/90 rounded-2xl border border-slate-700 space-y-3 relative group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                  <Building className="w-5 h-5" />
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 block">
                    Method 1 • Bank Transfer
                  </span>

                  <h3 className="text-base font-extrabold text-white">
                    JS Bank
                  </h3>
                </div>
              </div>

              <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
                Bank
              </span>
            </div>

            <div className="space-y-2 pt-1 border-t border-slate-700/60 text-xs">
              <div className="flex justify-between items-center bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">
                    Account Number
                  </span>

                  <span className="font-mono text-base font-black text-emerald-400 tracking-wider">
                    0002871419
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText('0002871419');
                    success('JS Bank account number copied!');
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1 border border-slate-700 transition-colors cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </button>
              </div>

              <div className="flex justify-between items-center px-1">
                <span className="text-slate-400">Account Name:</span>
                <span className="font-bold text-white text-sm">
                  Khizer Abbas
                </span>
              </div>
            </div>
          </div>

          {/* Method 2: NayaPay */}
          <div className="p-5 bg-slate-800/90 rounded-2xl border border-slate-700 space-y-3 relative group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <Smartphone className="w-5 h-5" />
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                    Method 2 • Mobile Wallet
                  </span>

                  <h3 className="text-base font-extrabold text-white">
                    NayaPay
                  </h3>
                </div>
              </div>

              <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                Wallet
              </span>
            </div>

            <div className="space-y-2 pt-1 border-t border-slate-700/60 text-xs">
              <div className="flex justify-between items-center bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">
                    NayaPay Number
                  </span>

                  <span className="font-mono text-base font-black text-emerald-400 tracking-wider">
                    03246362855
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText('03246362855');
                    success('NayaPay number copied!');
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1 border border-slate-700 transition-colors cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </button>
              </div>

              <div className="flex justify-between items-center px-1">
                <span className="text-slate-400">Account Name:</span>
                <span className="font-bold text-white text-sm">
                  Khizer Abbas
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Verification Notice */}
        <div className="p-4 sm:p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 space-y-4">
          <div className="flex items-start gap-3 text-xs text-slate-300">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />

            <p className="leading-relaxed">
              <strong className="text-white">
                Manual Verification Notice:
              </strong>{' '}
              Payment is manually verified by central administration after
              receipt of transfer proof. Payments are{' '}
              <span className="text-amber-300 font-semibold">
                NOT automatically verified
              </span>
              . Please submit your proof below and send it directly on
              WhatsApp.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-emerald-500/20">
            <span className="text-xs text-emerald-300 font-medium">
              Official WhatsApp Desk:{' '}
              <strong className="font-mono text-white">
                03246362855
              </strong>
            </span>

            <a
              href={`https://wa.me/923246362855?text=${encodeURIComponent(
                `Assalam o Alaikum,\nI have transferred the 1,300 PKR joining payment for Digital Success Network.\n\nMember Name: ${user.fullName}\nEmail: ${user.email}\nPhone: ${user.phone}\nAmount: 1,300 PKR\n\nPlease find my payment proof screenshot attached. Kindly verify and activate my DSN account.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-extrabold text-sm text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-900/50 transition-all active:scale-98 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Send Payment Proof on WhatsApp</span>
            </a>
          </div>
        </div>
      </div>

      {/* Submission Form */}
      {profile.accountStatus !== 'active' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 font-display mb-4">
            Submit Transaction Details
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Transaction ID (Trx ID / TID) *
                </label>

                <input
                  type="text"
                  required
                  placeholder="e.g. 02938491823"
                  value={transactionId}
                  onChange={e => setTransactionId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Amount Transferred (PKR) *
                </label>

                <input
                  type="number"
                  required
                  value={amount}
                  onChange={e => setAmount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Payment Channel Used *
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { key: 'bank_transfer', label: 'JS Bank' },
                  { key: 'nayapay', label: 'NayaPay' },
                  { key: 'jazzcash', label: 'JazzCash' },
                  { key: 'easypaisa', label: 'EasyPaisa' }
                ].map(item => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setMethod(item.key as PayoutMethod)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold capitalize transition-all border ${
                      method === item.key
                        ? 'bg-blue-50 border-blue-500 text-blue-800 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Sender Account Name *
                </label>

                <input
                  type="text"
                  required
                  value={senderName}
                  onChange={e => setSenderName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Sender Mobile / Account Number *
                </label>

                <input
                  type="text"
                  required
                  value={senderAccount}
                  onChange={e => setSenderAccount(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="p-4 border-2 border-dashed border-slate-200 rounded-2xl text-center space-y-2">
              <Upload className="w-6 h-6 text-slate-400 mx-auto" />

              <span className="text-xs font-bold text-slate-700 block">
                Attach Payment Screenshot / SMS Receipt
              </span>

              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />

              {receiptImage && (
                <span className="text-[11px] text-emerald-600 font-bold block">
                  Screenshot Attached ✓
                </span>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Optional Notes
              </label>

              <input
                type="text"
                placeholder="Any additional remarks..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 shadow-md transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>
                {loading ? 'Submitting...' : 'Submit Payment Proof'}
              </span>
            </button>
          </form>
        </div>
      )}

      {/* History */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Previous Submissions ({proofs.length})
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <th className="py-3 px-4">Trx ID</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Sender Account</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Submitted At</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {proofs.map(p => (
                <tr
                  key={p.id}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">
                    {p.transactionId}
                  </td>

                  <td className="py-3 px-4 font-bold text-slate-800">
                    {p.amount.toLocaleString()} PKR
                  </td>

                  <td className="py-3 px-4 capitalize text-slate-600">
                    {p.paymentMethod.replace('_', ' ')}
                  </td>

                  <td className="py-3 px-4 font-mono text-slate-500">
                    {p.senderAccount}
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full capitalize ${
                        p.status === 'approved'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : p.status === 'pending'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-slate-400 text-xs">
                    {new Date(
                      p.createdAt || p.dateSubmitted
                    ).toLocaleDateString()}
                  </td>
                </tr>
              ))}

              {proofs.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="py-8 text-center text-slate-400 text-xs"
                  >
                    No payment submissions yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
```
