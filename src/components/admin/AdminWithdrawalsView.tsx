import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { adminService, withdrawalService } from '../../services';
import { devStore } from '../../store/devStore';
import { Check, X, Clock, Wallet, DollarSign } from 'lucide-react';
import { WithdrawalRequest } from '../../types';

export const AdminWithdrawalsView: React.FC = () => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [filter, setFilter] = useState<'pending' | 'processing' | 'paid' | 'rejected' | 'all'>('pending');
  const [selectedReq, setSelectedReq] = useState<WithdrawalRequest | null>(null);
  const [actionModal, setActionModal] = useState<'pay' | 'reject' | null>(null);
  const [trxRef, setTrxRef] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const db = devStore.getData();
  const allWithdrawals = withdrawalService.getAllWithdrawals();

  const filtered = allWithdrawals.filter(w => {
    if (filter === 'all') return true;
    return w.status === filter;
  });

  const handlePay = () => {
    if (!user || !selectedReq) return;
    setLoading(true);
    const res = adminService.processWithdrawal(selectedReq.id, 'paid', user.id, trxRef ? `Paid Ref: ${trxRef}` : 'Paid via manual transfer');
    setLoading(false);

    if (res.success) {
      success(`Withdrawal ${selectedReq.id} marked as Paid!`);
      setActionModal(null);
      setSelectedReq(null);
      setTrxRef('');
      setRefreshTrigger(prev => prev + 1);
    } else {
      error(res.error || 'Failed to process payout.');
    }
  };

  const handleReject = () => {
    if (!user || !selectedReq) return;
    if (!rejectReason.trim()) {
      error('Please provide a reason for rejecting this withdrawal.');
      return;
    }
    setLoading(true);
    const res = adminService.rejectWithdrawal(selectedReq.id, user.id, rejectReason.trim());
    setLoading(false);

    if (res.success) {
      success(`Withdrawal ${selectedReq.id} rejected and ${selectedReq.grossAmount} PKR refunded to member.`);
      setActionModal(null);
      setSelectedReq(null);
      setRejectReason('');
      setRefreshTrigger(prev => prev + 1);
    } else {
      error(res.error || 'Failed to reject withdrawal.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white font-display">
            Withdrawal Requests & Disbursals
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage member payout queues for JazzCash, EasyPaisa, and Pakistani Banks.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs">
          {(['pending', 'processing', 'paid', 'rejected', 'all'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-xl font-bold capitalize transition-all ${
                filter === f ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-900/60 text-slate-400 font-bold border-b border-slate-800">
                <th className="py-3 px-4">Req ID</th>
                <th className="py-3 px-4">Member Name</th>
                <th className="py-3 px-4">Gross Req</th>
                <th className="py-3 px-4">Fee (2%)</th>
                <th className="py-3 px-4">Net Payout</th>
                <th className="py-3 px-4">Payout Method & Details</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filtered.map(w => {
                const member = db.users.find(u => u.id === w.userId);

                return (
                  <tr key={w.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                      {w.id}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-200">{member?.fullName || w.accountTitle}</p>
                      <p className="text-[11px] font-mono text-slate-500">{member?.referralCode}</p>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-300">
                      {w.grossAmount.toLocaleString()} PKR
                    </td>
                    <td className="py-3 px-4 text-rose-400 font-medium">
                      -{w.feeAmount} PKR
                    </td>
                    <td className="py-3 px-4 font-black text-emerald-400 text-sm">
                      {w.netAmount.toLocaleString()} PKR
                    </td>
                    <td className="py-3 px-4">
                      <span className="capitalize font-bold text-slate-300 block">
                        {w.payoutMethod.replace('_', ' ')}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {w.accountTitle} • {w.accountNumber}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full capitalize ${
                          w.status === 'paid'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : w.status === 'pending'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : w.status === 'processing'
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {w.status}
                      </span>
                      {w.remarks && (
                        <span className="block text-[10px] text-slate-500 mt-0.5">
                          {w.remarks}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {(w.status === 'pending' || w.status === 'processing') && (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedReq(w);
                              setActionModal('pay');
                            }}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs"
                          >
                            Pay
                          </button>
                          <button
                            onClick={() => {
                              setSelectedReq(w);
                              setActionModal('reject');
                            }}
                            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-xs"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 text-xs">
                    No withdrawal records in this queue.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pay Modal */}
      {actionModal === 'pay' && selectedReq && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4">
            <h2 className="text-base font-bold text-white font-display">
              Confirm Withdrawal Payout
            </h2>
            <div className="p-4 bg-slate-900 rounded-2xl text-xs space-y-1.5">
              <div className="flex justify-between text-slate-400">
                <span>Net Transfer Amount:</span>
                <span className="font-bold text-emerald-400 text-sm">{selectedReq.netAmount} PKR</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Destination:</span>
                <span className="capitalize font-semibold text-white">{selectedReq.payoutMethod.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Account Number:</span>
                <span className="font-mono text-white">{selectedReq.accountNumber}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Disbursal Transaction / Reference ID (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. TR-9988123"
                value={trxRef}
                onChange={e => setTrxRef(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setActionModal(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handlePay}
                disabled={loading}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
              >
                Mark as Paid
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {actionModal === 'reject' && selectedReq && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4">
            <h2 className="text-base font-bold text-white font-display">
              Reject Withdrawal & Refund Balance
            </h2>
            <p className="text-xs text-slate-400">
              Rejecting this request will automatically refund <strong>{selectedReq.grossAmount} PKR</strong> back to the member's available balance.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Rejection Reason *
              </label>
              <textarea
                required
                rows={3}
                placeholder="e.g. Account number title mismatch. Please update and re-request."
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setActionModal(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={loading}
                className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold"
              >
                Confirm Rejection & Refund
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
