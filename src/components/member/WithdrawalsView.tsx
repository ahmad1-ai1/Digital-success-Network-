import React, { useState } from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { withdrawalService } from '../../services';
import {
  Wallet,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Send,
  XCircle,
  Receipt,
  MessageCircle,
  Copy,
  X,
  ShieldAlert
} from 'lucide-react';
import { PayoutMethod, Withdrawal } from '../../types';

export const WithdrawalsView: React.FC = () => {
  const { user, profile, refreshUser } = useAuth();
  const { success, error } = useToast();

  const [amount, setAmount] = useState<number | ''>('');
  const [method, setMethod] = useState<PayoutMethod>('jazzcash');
  const [accountTitle, setAccountTitle] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [userNote, setUserNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState<Withdrawal | null>(null);

  if (!user || !profile) return null;

  const history = withdrawalService.getWithdrawals(user.id);
  const minWithdrawal = withdrawalService.getMinWithdrawal();
  const feeRate = withdrawalService.getFeeRate();

  const numericAmount = typeof amount === 'number' ? amount : 0;
  const fee = Math.round(numericAmount * feeRate);
  const net = Math.max(0, numericAmount - fee);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (numericAmount < minWithdrawal) {
      error(`Minimum withdrawal amount is ${minWithdrawal} PKR.`);
      return;
    }

    if (numericAmount > profile.availableBalance) {
      error(`Insufficient available balance. You have ${profile.availableBalance} PKR.`);
      return;
    }

    if (!accountTitle.trim() || !accountNumber.trim()) {
      error('Please provide valid account title and account number.');
      return;
    }

    setLoading(true);
    const res = await withdrawalService.requestWithdrawal({
      userId: user.id,
      amount: numericAmount,
      payoutMethod: method,
      accountTitle: accountTitle.trim(),
      accountNumber: accountNumber.trim(),
      userNote: userNote.trim() || undefined
    });
    setLoading(false);

    if (res.success) {
      const receiptData: Withdrawal = res.withdrawal || {
        id: `WD-${Date.now().toString().slice(-6)}`,
        userId: user.id,
        userFullName: user.fullName,
        grossAmount: numericAmount,
        amount: numericAmount,
        feePercentage: feeRate * 100,
        feeAmount: fee,
        netAmount: net,
        paymentMethod: method === 'bank_transfer' ? 'Bank Transfer' : method === 'easypaisa' ? 'EasyPaisa' : 'JazzCash',
        payoutMethod: method,
        accountTitle: accountTitle.trim(),
        accountNumber: accountNumber.trim(),
        userNote: userNote.trim() || undefined,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      setActiveReceipt(receiptData);
      success('Withdrawal request submitted successfully! Please send to WhatsApp to continue.');
      setAmount('');
      setUserNote('');
      refreshUser();
    } else {
      error(res.error || 'Failed to submit withdrawal.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 font-display">
          Withdrawals & Payouts
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Shafaf withdrawal request portal with real-time 2% fee calculation.
        </p>
      </div>

      {/* Balance & Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Available to Withdraw
            </span>
            <span className="text-3xl font-black text-emerald-600 mt-1 block">
              {profile.availableBalance.toLocaleString()} <span className="text-xs font-semibold text-slate-500">PKR</span>
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Wallet className="w-6 h-6" />
          </div>
        </div>

        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Pending in Processing
            </span>
            <span className="text-2xl font-black text-amber-600 mt-1 block">
              {profile.pendingWithdrawals.toLocaleString()} <span className="text-xs font-semibold text-slate-500">PKR</span>
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Lifetime Paid Out
            </span>
            <span className="text-2xl font-black text-blue-700 mt-1 block">
              {history
                .filter(w => w.status === 'paid')
                .reduce((sum, w) => sum + w.netAmount, 0)
                .toLocaleString()}{' '}
              <span className="text-xs font-semibold text-slate-500">PKR</span>
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Two Columns: Request Form & Rules Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Request Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
          <h2 className="text-lg font-bold text-slate-900 font-display mb-4">
            Request New Withdrawal
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Withdrawal Amount (PKR) * [Min {minWithdrawal} PKR]
              </label>
              <input
                type="number"
                min={minWithdrawal}
                max={profile.availableBalance}
                required
                placeholder={`Minimum ${minWithdrawal}`}
                value={amount}
                onChange={e => setAmount(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all font-semibold"
              />
            </div>

            {/* Live calculation breakdown */}
            {numericAmount > 0 && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Gross Requested:</span>
                  <span className="font-bold text-slate-800">{numericAmount} PKR</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Processing Fee (2%):</span>
                  <span className="font-bold text-rose-600">-{fee} PKR</span>
                </div>
                <div className="flex justify-between text-emerald-800 font-bold pt-1 border-t border-slate-200 text-sm">
                  <span>Net Amount Transferred:</span>
                  <span>{net} PKR</span>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Payout Method *
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['jazzcash', 'easypaisa', 'bank_transfer'] as PayoutMethod[]).map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMethod(m)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold capitalize transition-all border ${
                      method === m
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {m.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Account Holder Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ahmad Khan"
                  value={accountTitle}
                  onChange={e => setAccountTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {method === 'bank_transfer' ? 'IBAN / Bank Account No. *' : 'Mobile Account No. *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={method === 'bank_transfer' ? 'PK36BAHL...' : '03001234567'}
                  value={accountNumber}
                  onChange={e => setAccountNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Optional User Note
              </label>
              <input
                type="text"
                placeholder="Any special remarks or bank branch name..."
                value={userNote}
                onChange={e => setUserNote(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading || profile.availableBalance < minWithdrawal}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Submitting...' : 'Submit Withdrawal Request'}</span>
            </button>
          </form>
        </div>

        {/* Withdrawal Rules & Notice */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 font-display">
              Withdrawal Governance Rules
            </h3>
            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p>
                  <strong>Kam az Kam Raqam:</strong> Minimum allowable withdrawal is <strong>20 PKR</strong>.
                </p>
              </div>

              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p>
                  <strong>Unlimited Withdrawals:</strong> Aap jab chahein jitni baar chahein withdrawal request bhej sakte hain, koi daily ya monthly limit nahi hai.
                </p>
              </div>

              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p>
                  <strong>Shafaf 2% Fee:</strong> 2% processing fee is deducted from the gross amount (e.g., 1,000 PKR gross = 20 PKR fee + 980 PKR net transfer).
                </p>
              </div>

              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p>
                  <strong>Supported Payouts:</strong> JazzCash, EasyPaisa, and Pakistani Bank Transfers.
                </p>
              </div>

              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p>
                  <strong>Manual WhatsApp Clearance:</strong> Request submit karne ke baad receipt confirmation WhatsApp (03246362855) par bhej kar withdrawal process continue karein.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Withdrawal Receipt Modal / Dialog */}
      {activeReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-slate-900 text-white p-6 relative">
              <button
                type="button"
                onClick={() => setActiveReceipt(null)}
                className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                    Digital Success Network
                  </span>
                  <h3 className="text-lg font-black text-white font-display">
                    Withdrawal Receipt & Confirmation
                  </h3>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-xs pt-3 border-t border-slate-800 text-slate-300">
                <span>Receipt ID: <strong className="font-mono text-white">{activeReceipt.id}</strong></span>
                <span>{new Date(activeReceipt.createdAt).toLocaleString()}</span>
              </div>
            </div>

            {/* Receipt Body */}
            <div className="p-6 space-y-4 text-xs">
              {/* Status Alert: Explicitly PENDING */}
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-amber-800">
                  <span className="font-bold block">Status: PENDING (Under Admin Review)</span>
                  <p className="text-[11px] text-amber-700 mt-0.5">
                    Yeh withdrawal request pending hai. Admin verification ke baad hi raqam transfer ki jaye gi.
                  </p>
                </div>
              </div>

              {/* Financial Breakdown */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex justify-between items-center text-slate-600">
                  <span>Gross Withdrawal Amount:</span>
                  <span className="font-black text-slate-900 text-sm">
                    {activeReceipt.grossAmount.toLocaleString()} PKR
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Processing Fee (2%):</span>
                  <span className="font-bold text-rose-600">
                    -{activeReceipt.feeAmount.toLocaleString()} PKR
                  </span>
                </div>
                <div className="flex justify-between items-center text-emerald-800 pt-2 border-t border-slate-200 font-extrabold text-base">
                  <span>Net Payout Amount:</span>
                  <span className="text-lg text-emerald-600">
                    {activeReceipt.netAmount.toLocaleString()} PKR
                  </span>
                </div>
              </div>

              {/* Account Details */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span>Payment Method:</span>
                  <span className="font-bold text-slate-900 capitalize">
                    {activeReceipt.payoutMethod?.replace('_', ' ') || activeReceipt.paymentMethod}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Account Title:</span>
                  <span className="font-bold text-slate-900">{activeReceipt.accountTitle}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Account / Mobile Number:</span>
                  <span className="font-mono font-bold text-slate-900">{activeReceipt.accountNumber}</span>
                </div>
                {activeReceipt.userNote && (
                  <div className="flex justify-between text-slate-600 pt-1 border-t border-slate-200">
                    <span>Note:</span>
                    <span className="text-slate-700 italic">{activeReceipt.userNote}</span>
                  </div>
                )}
              </div>

              {/* Action notice */}
              <p className="text-[11px] text-slate-500 text-center leading-relaxed">
                Apna withdrawal process foran jari rakhnay ke liye, is receipt ki maloomat WhatsApp par bhein:
              </p>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <a
                  href={`https://wa.me/923246362855?text=${encodeURIComponent(
                    `Assalam o Alaikum,\nI have submitted a withdrawal request on Digital Success Network.\n\nReceipt ID: ${activeReceipt.id}\nMember Name: ${user.fullName}\nGross Amount: ${activeReceipt.grossAmount} PKR\nProcessing Fee (2%): ${activeReceipt.feeAmount} PKR\nNet Payout: ${activeReceipt.netAmount} PKR\nPayment Method: ${activeReceipt.payoutMethod || activeReceipt.paymentMethod}\nAccount Title: ${activeReceipt.accountTitle}\nAccount Number: ${activeReceipt.accountNumber}\nStatus: Pending\n\nPlease continue and process my withdrawal.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-4 rounded-xl font-extrabold text-sm text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Send to Continue Withdrawal</span>
                </a>

                <button
                  type="button"
                  onClick={() => setActiveReceipt(null)}
                  className="w-full py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
                >
                  Close Receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Withdrawal History Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Withdrawal Requests History ({history.length} records)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <th className="py-3 px-4">Request ID</th>
                <th className="py-3 px-4">Gross Amount</th>
                <th className="py-3 px-4">Fee (2%)</th>
                <th className="py-3 px-4">Net Payout</th>
                <th className="py-3 px-4">Method & Account</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Requested At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {history.map(w => (
                <tr key={w.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                    {w.id}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {w.grossAmount.toLocaleString()} PKR
                  </td>
                  <td className="py-3 px-4 text-rose-600 font-medium">
                    -{w.feeAmount} PKR
                  </td>
                  <td className="py-3 px-4 font-extrabold text-emerald-600">
                    {w.netAmount.toLocaleString()} PKR
                  </td>
                  <td className="py-3 px-4">
                    <span className="capitalize font-bold text-slate-800 block text-xs">
                      {w.payoutMethod?.replace('_', ' ') || w.paymentMethod}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">
                      {w.accountTitle} ({w.accountNumber})
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full capitalize ${
                        w.status === 'paid'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : w.status === 'pending'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : w.status === 'processing'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {w.status}
                    </span>
                    {w.remarks && (
                      <span className="block text-[10px] text-slate-400 mt-0.5">
                        Note: {w.remarks}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <button
                      type="button"
                      onClick={() => setActiveReceipt(w)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>Receipt</span>
                    </button>
                  </td>
                  <td className="py-3 px-4 text-slate-400 text-xs">
                    {new Date(w.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}

              {history.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                    No withdrawal requests submitted yet.
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
