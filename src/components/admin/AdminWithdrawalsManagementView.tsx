import React, { useState, useEffect } from 'react';
import { adminPortalService, WithdrawalItem } from '../../services/adminPortalService';
import { useToast } from '../../context/ToastContext';
import {
  Search,
  Filter,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Wallet,
  AlertTriangle,
  User,
  Calendar,
  CreditCard,
  Hash,
  X,
  Check,
  Loader2,
  DollarSign,
  FileText,
  Building,
  Smartphone
} from 'lucide-react';

export const AdminWithdrawalsManagementView: React.FC = () => {
  const { success, error } = useToast();

  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDetails, setSelectedDetails] = useState<WithdrawalItem | null>(null);

  // Actions
  const [approveItem, setApproveItem] = useState<WithdrawalItem | null>(null);
  const [transactionRef, setTransactionRef] = useState('');
  const [rejectItem, setRejectItem] = useState<WithdrawalItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    adminPortalService.loadFromSupabase().then(() => {
      setRefreshTrigger(prev => prev + 1);
    });
  }, []);

  const withdrawals = adminPortalService.getWithdrawals(statusFilter);

  const filteredWithdrawals = withdrawals.filter(item => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.userName.toLowerCase().includes(q) ||
      item.userId.toLowerCase().includes(q) ||
      item.accountTitle.toLowerCase().includes(q) ||
      item.accountNumber.toLowerCase().includes(q) ||
      item.withdrawalMethod.toLowerCase().includes(q)
    );
  });

  const handleConfirmApprove = async () => {
    if (!approveItem) return;
    setActionLoading(true);

    try {
      const res = await adminPortalService.approveWithdrawal(
        approveItem.id,
        transactionRef.trim() || 'TRX-PAYOUT-' + Math.floor(100000 + Math.random() * 900000)
      );

      if (res.success) {
        success(`Withdrawal (${approveItem.id}) for ${approveItem.userName} marked as Approved & Disbursed.`);
        setApproveItem(null);
        setTransactionRef('');
        if (selectedDetails?.id === approveItem.id) {
          setSelectedDetails(null);
        }
        setRefreshTrigger(prev => prev + 1);
      } else {
        error(res.error || 'Failed to approve payout.');
      }
    } catch (err: any) {
      error(err?.message || 'Error occurred while processing payout.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectItem) return;
    if (!rejectionReason.trim()) {
      error('Please provide a reason for rejecting the withdrawal request.');
      return;
    }

    setActionLoading(true);
    try {
      const res = await adminPortalService.rejectWithdrawal(rejectItem.id, rejectionReason.trim());
      if (res.success) {
        success(`Withdrawal of ${rejectItem.grossAmount} PKR rejected. Balance refunded to ${rejectItem.userName}.`);
        setRejectItem(null);
        setRejectionReason('');
        if (selectedDetails?.id === rejectItem.id) {
          setSelectedDetails(null);
        }
        setRefreshTrigger(prev => prev + 1);
      } else {
        error(res.error || 'Failed to reject withdrawal.');
      }
    } catch (err: any) {
      error(err?.message || 'Error occurred while rejecting withdrawal.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display">
            Withdrawal Requests
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Review earnings withdrawal queues, inspect beneficiary account details, and disburse payouts.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 text-xs self-start sm:self-auto">
          {(['all', 'pending', 'approved', 'rejected'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3.5 py-1.5 rounded-xl font-bold capitalize transition-all cursor-pointer ${
                statusFilter === tab
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab === 'approved' ? 'Approved / Paid' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by member name, User ID, account title, or wallet number..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
          />
        </div>
      </div>

      {/* Withdrawals Table */}
      <div className="bg-slate-900/90 rounded-3xl border border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-950/70 text-slate-400 font-bold border-b border-slate-800 text-[11px] uppercase tracking-wider">
                <th className="py-3.5 px-4">Member Info</th>
                <th className="py-3.5 px-4">Requested Amount</th>
                <th className="py-3.5 px-4">Payout Method</th>
                <th className="py-3.5 px-4">Account / Wallet Details</th>
                <th className="py-3.5 px-4">Date / Time</th>
                <th className="py-3.5 px-4">Current Status</th>
                <th className="py-3.5 px-4">Details</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredWithdrawals.map(item => (
                <tr key={item.id} className="hover:bg-slate-950/40 transition-colors">
                  {/* Member Info */}
                  <td className="py-4 px-4">
                    <div className="font-bold text-slate-200">{item.userName}</div>
                    <div className="text-[11px] font-mono text-slate-400">ID: {item.userId}</div>
                    <div className="text-[11px] text-slate-500">{item.userEmail}</div>
                  </td>

                  {/* Requested Amount */}
                  <td className="py-4 px-4">
                    <div className="font-bold text-white font-mono text-sm">
                      {item.grossAmount.toLocaleString()} PKR
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Net: <span className="text-emerald-400 font-semibold">{item.netAmount.toLocaleString()} PKR</span> (2% Fee: {item.feeAmount} PKR)
                    </div>
                  </td>

                  {/* Payout Method */}
                  <td className="py-4 px-4">
                    <span className="font-semibold text-slate-200 block">{item.withdrawalMethod}</span>
                    <span className="text-[11px] text-slate-500 font-mono">Ref: {item.id}</span>
                  </td>

                  {/* Account / Wallet Details */}
                  <td className="py-4 px-4 text-xs">
                    <div className="text-slate-200 font-semibold">{item.accountTitle}</div>
                    <div className="font-mono text-slate-400">{item.accountNumber}</div>
                  </td>

                  {/* Date / Time */}
                  <td className="py-4 px-4 text-slate-400 text-xs whitespace-nowrap">
                    <div>{new Date(item.createdAt).toLocaleDateString()}</div>
                    <div className="text-[11px] text-slate-500">
                      {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>

                  {/* Current Status */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    {item.status === 'pending' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                        <Clock className="w-3 h-3" />
                        <span>Pending</span>
                      </span>
                    )}
                    {item.status === 'approved' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Approved</span>
                      </span>
                    )}
                    {item.status === 'rejected' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30">
                        <XCircle className="w-3 h-3" />
                        <span>Rejected</span>
                      </span>
                    )}
                  </td>

                  {/* View Details Button */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <button
                      onClick={() => setSelectedDetails(item)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-emerald-400" />
                      <span>View Details</span>
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-4 text-right whitespace-nowrap">
                    {item.status === 'pending' ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setApproveItem(item);
                            setTransactionRef('');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow-xs cursor-pointer"
                        >
                          <Check className="w-3 h-3" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => {
                            setRejectItem(item);
                            setRejectionReason('');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-500 italic">Disbursed</span>
                    )}
                  </td>
                </tr>
              ))}

              {filteredWithdrawals.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 text-xs">
                    No withdrawal requests
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 1. VIEW WITHDRAWAL DETAILS MODAL */}
      {selectedDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedDetails(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white font-display">
                  Withdrawal Request Details
                </h3>
                <p className="text-xs text-slate-400">
                  Request Ref: <span className="font-mono text-emerald-400 font-bold">{selectedDetails.id}</span>
                </p>
              </div>
            </div>

            {/* Financial breakdown */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 mb-5">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Requested Amount (Gross):</span>
                <span className="text-white font-bold font-mono">{selectedDetails.grossAmount.toLocaleString()} PKR</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>DSN Service Fee (2%):</span>
                <span className="text-rose-400 font-bold font-mono">-{selectedDetails.feeAmount.toLocaleString()} PKR</span>
              </div>
              <div className="flex justify-between text-sm text-slate-200 pt-2 border-t border-slate-800">
                <span className="font-bold">Net Payout to Member:</span>
                <span className="text-emerald-400 font-black font-mono text-base">{selectedDetails.netAmount.toLocaleString()} PKR</span>
              </div>
            </div>

            {/* Beneficiary Details Grid */}
            <div className="space-y-3 p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs mb-6">
              <div className="flex justify-between">
                <span className="text-slate-500">Member Name:</span>
                <span className="text-white font-semibold">{selectedDetails.userName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">User ID:</span>
                <span className="text-white font-mono">{selectedDetails.userId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Beneficiary Method:</span>
                <span className="text-slate-200 font-semibold">{selectedDetails.withdrawalMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Account Title:</span>
                <span className="text-slate-200 font-semibold">{selectedDetails.accountTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Account / IBAN Number:</span>
                <span className="text-emerald-400 font-mono font-bold">{selectedDetails.accountNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Submission Date:</span>
                <span className="text-slate-300">{new Date(selectedDetails.createdAt).toLocaleString()}</span>
              </div>
              {selectedDetails.userNote && (
                <div className="pt-2 border-t border-slate-800 text-slate-400">
                  <span className="text-slate-500 block mb-0.5">User Remark:</span>
                  <p className="italic text-slate-300">{selectedDetails.userNote}</p>
                </div>
              )}
              {selectedDetails.transactionRef && (
                <div className="pt-2 border-t border-slate-800 flex justify-between">
                  <span className="text-slate-500">Disbursement Reference:</span>
                  <span className="text-blue-400 font-mono font-bold">{selectedDetails.transactionRef}</span>
                </div>
              )}
            </div>

            {/* Decision Controls */}
            {selectedDetails.status === 'pending' ? (
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  onClick={() => {
                    setRejectItem(selectedDetails);
                    setRejectionReason('');
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-bold transition-all cursor-pointer"
                >
                  Reject Payout
                </button>
                <button
                  onClick={() => {
                    setApproveItem(selectedDetails);
                    setTransactionRef('');
                  }}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Approve & Mark Paid</span>
                </button>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-slate-800/40 text-xs text-slate-400 text-center">
                This withdrawal request is currently <span className="font-bold text-white capitalize">{selectedDetails.status}</span>.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. APPROVE / PROCESS PAYOUT MODAL */}
      {approveItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-white font-display mb-1">
              Confirm Withdrawal Approval
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Confirm dispersement of <span className="text-emerald-400 font-bold">{approveItem.netAmount.toLocaleString()} PKR</span> to <span className="text-white font-bold">{approveItem.accountTitle}</span> ({approveItem.withdrawalMethod}).
            </p>

            <div className="space-y-3 mb-6">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Bank / Mobile Wallet Reference No. (Optional)
              </label>
              <input
                type="text"
                value={transactionRef}
                onChange={e => setTransactionRef(e.target.value)}
                placeholder="e.g. JC-8942103 or FT-992140"
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 text-xs font-mono focus:outline-hidden focus:border-emerald-500"
              />
              <p className="text-[11px] text-slate-500">
                Recording the bank transaction or JazzCash/EasyPaisa TID allows transparent audit tracking for the member.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                disabled={actionLoading}
                onClick={() => setApproveItem(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={actionLoading}
                onClick={handleConfirmApprove}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                <span>Confirm Disbursal</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. REJECT WITHDRAWAL MODAL */}
      {rejectItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <div className="w-12 h-12 rounded-2xl bg-rose-600/20 text-rose-400 flex items-center justify-center border border-rose-500/30 mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-white font-display mb-1">
              Reject Withdrawal Request
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Specify the reason for rejection. The gross amount (<span className="text-white font-bold">{rejectItem.grossAmount.toLocaleString()} PKR</span>) will be automatically refunded to <span className="text-white font-semibold">{rejectItem.userName}</span>'s available balance.
            </p>

            <div className="space-y-3 mb-6">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Rejection Reason
              </label>
              <textarea
                rows={3}
                required
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                placeholder="e.g. Account title mismatch with registered CNIC, wallet limit exceeded, or invalid IBAN..."
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 text-xs focus:outline-hidden focus:border-rose-500"
              />

              <div className="flex flex-wrap gap-1.5 pt-1">
                {[
                  'Account title does not match member profile',
                  'Incorrect wallet / account number provided',
                  'Receiving wallet balance limit exceeded',
                  'Member requested withdrawal cancellation'
                ].map(preset => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setRejectionReason(preset)}
                    className="text-[10px] px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                disabled={actionLoading}
                onClick={() => setRejectItem(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={actionLoading}
                onClick={handleConfirmReject}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/30 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                <span>Reject & Refund Member</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
