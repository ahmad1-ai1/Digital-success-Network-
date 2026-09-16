import React, { useState, useEffect } from 'react';
import { adminPortalService, DepositItem } from '../../services/adminPortalService';
import { useToast } from '../../context/ToastContext';
import {
  Search,
  Filter,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Receipt,
  AlertTriangle,
  User,
  Calendar,
  CreditCard,
  Hash,
  ExternalLink,
  X,
  Check,
  Loader2,
  FileText
} from 'lucide-react';

export const AdminDepositsView: React.FC = () => {
  const { success, error } = useToast();

  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProof, setSelectedProof] = useState<DepositItem | null>(null);

  // Confirmation Modals
  const [approveConfirmItem, setApproveConfirmItem] = useState<DepositItem | null>(null);
  const [rejectItem, setRejectItem] = useState<DepositItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    adminPortalService.loadFromSupabase().then(() => {
      setRefreshTrigger(prev => prev + 1);
    });
  }, []);

  const deposits = adminPortalService.getDeposits(statusFilter);

  const filteredDeposits = deposits.filter(item => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.userName.toLowerCase().includes(q) ||
      item.userId.toLowerCase().includes(q) ||
      item.transactionId.toLowerCase().includes(q) ||
      item.senderAccount.toLowerCase().includes(q) ||
      item.paymentMethod.toLowerCase().includes(q)
    );
  });

  const handleConfirmApprove = async () => {
    if (!approveConfirmItem) return;
    setActionLoading(true);

    try {
      const res = await adminPortalService.approveDeposit(approveConfirmItem.id);
      if (res.success) {
        success(`Payment proof (${approveConfirmItem.transactionId}) for ${approveConfirmItem.userName} approved successfully.`);
        setApproveConfirmItem(null);
        if (selectedProof?.id === approveConfirmItem.id) {
          setSelectedProof(null);
        }
        setRefreshTrigger(prev => prev + 1);
      } else {
        error(res.error || 'Failed to approve deposit.');
      }
    } catch (err: any) {
      error(err?.message || 'Error occurred while approving.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectItem) return;
    if (!rejectionReason.trim()) {
      error('Please specify a rejection reason for the member.');
      return;
    }

    setActionLoading(true);
    try {
      const res = await adminPortalService.rejectDeposit(rejectItem.id, rejectionReason.trim());
      if (res.success) {
        success(`Deposit for ${rejectItem.userName} has been rejected.`);
        setRejectItem(null);
        setRejectionReason('');
        if (selectedProof?.id === rejectItem.id) {
          setSelectedProof(null);
        }
        setRefreshTrigger(prev => prev + 1);
      } else {
        error(res.error || 'Failed to reject deposit.');
      }
    } catch (err: any) {
      error(err?.message || 'Error occurred while rejecting.');
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
            Deposits & Payment Verification
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Review submitted deposit slips, inspect transaction references, and verify activation fees.
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
              {tab}
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
            placeholder="Search by member name, User ID, Trx ID, or phone..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
          />
        </div>
      </div>

      {/* Table & Cards */}
      <div className="bg-slate-900/90 rounded-3xl border border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-950/70 text-slate-400 font-bold border-b border-slate-800 text-[11px] uppercase tracking-wider">
                <th className="py-3.5 px-4">Member Info</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Channel & Trx ID</th>
                <th className="py-3.5 px-4">Sender Details</th>
                <th className="py-3.5 px-4">Date / Time</th>
                <th className="py-3.5 px-4">Current Status</th>
                <th className="py-3.5 px-4">Proof</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredDeposits.map(item => (
                <tr key={item.id} className="hover:bg-slate-950/40 transition-colors">
                  {/* Member Info */}
                  <td className="py-4 px-4">
                    <div className="font-bold text-slate-200">{item.userName}</div>
                    <div className="text-[11px] font-mono text-slate-400">ID: {item.userId}</div>
                    <div className="text-[11px] text-slate-500">{item.userEmail}</div>
                  </td>

                  {/* Amount */}
                  <td className="py-4 px-4 font-bold text-emerald-400 font-mono text-sm whitespace-nowrap">
                    {item.amount.toLocaleString()} PKR
                  </td>

                  {/* Channel & Trx ID */}
                  <td className="py-4 px-4">
                    <span className="font-semibold text-slate-300 block">{item.paymentMethod}</span>
                    <span className="font-mono text-xs text-blue-400 font-bold block mt-0.5">
                      {item.transactionId}
                    </span>
                  </td>

                  {/* Sender Details */}
                  <td className="py-4 px-4 text-xs">
                    <div className="text-slate-300 font-medium">{item.senderName}</div>
                    <div className="font-mono text-slate-400">{item.senderAccount}</div>
                  </td>

                  {/* Date/Time */}
                  <td className="py-4 px-4 text-slate-400 text-xs whitespace-nowrap">
                    <div>{new Date(item.createdAt).toLocaleDateString()}</div>
                    <div className="text-[11px] text-slate-500">
                      {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>

                  {/* Status Badge */}
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

                  {/* Payment Proof Button */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <button
                      onClick={() => setSelectedProof(item)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
                      title="View Proof"
                    >
                      <Eye className="w-3.5 h-3.5 text-blue-400" />
                      <span>View Proof</span>
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-4 text-right whitespace-nowrap">
                    {item.status === 'pending' ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setApproveConfirmItem(item)}
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
                      <span className="text-xs text-slate-500 italic">Completed</span>
                    )}
                  </td>
                </tr>
              ))}

              {filteredDeposits.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 text-xs">
                    {statusFilter === 'pending' || deposits.length === 0 ? 'No pending deposits' : 'No deposit requests'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 1. VIEW PROOF MODAL */}
      {selectedProof && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative">
            <button
              onClick={() => setSelectedProof(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white font-display">
                  Deposit Proof Inspection
                </h3>
                <p className="text-xs text-slate-400">
                  Transaction Reference: <span className="font-mono text-blue-400 font-bold">{selectedProof.transactionId}</span>
                </p>
              </div>
            </div>

            {/* Proof Image Preview */}
            <div className="mb-6 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center p-2 relative group min-h-[220px]">
              <img
                src={selectedProof.receiptUrl}
                alt="Receipt Proof"
                className="max-h-[350px] w-auto object-contain rounded-xl"
              />
              <a
                href={selectedProof.receiptUrl}
                target="_blank"
                rel="noreferrer"
                className="absolute bottom-4 right-4 bg-slate-900/90 hover:bg-slate-900 text-white text-xs px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Full Image</span>
              </a>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs mb-6">
              <div>
                <span className="text-slate-500 block">Member Name:</span>
                <span className="text-white font-semibold">{selectedProof.userName}</span>
              </div>
              <div>
                <span className="text-slate-500 block">User ID:</span>
                <span className="text-white font-mono">{selectedProof.userId}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Amount:</span>
                <span className="text-emerald-400 font-bold font-mono">{selectedProof.amount.toLocaleString()} PKR</span>
              </div>
              <div>
                <span className="text-slate-500 block">Payment Channel:</span>
                <span className="text-white font-semibold">{selectedProof.paymentMethod}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Sender Name & Account:</span>
                <span className="text-slate-300">{selectedProof.senderName} ({selectedProof.senderAccount})</span>
              </div>
              <div>
                <span className="text-slate-500 block">Submitted At:</span>
                <span className="text-slate-300">{new Date(selectedProof.createdAt).toLocaleString()}</span>
              </div>
              {selectedProof.userNotes && (
                <div className="col-span-1 sm:col-span-2 pt-2 border-t border-slate-800">
                  <span className="text-slate-500 block">Member Notes:</span>
                  <span className="text-slate-300 italic">{selectedProof.userNotes}</span>
                </div>
              )}
            </div>

            {/* Decision Controls inside Modal */}
            {selectedProof.status === 'pending' ? (
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  onClick={() => {
                    setRejectItem(selectedProof);
                    setRejectionReason('');
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-bold transition-all cursor-pointer"
                >
                  Reject Proof
                </button>
                <button
                  onClick={() => setApproveConfirmItem(selectedProof)}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Approve & Activate Member</span>
                </button>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-slate-800/40 text-xs text-slate-400 text-center">
                This deposit is already <span className="font-bold text-white capitalize">{selectedProof.status}</span>.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. CONFIRM APPROVAL MODAL */}
      {approveConfirmItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-white font-display mb-2">
              Confirm Payment Approval
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Are you sure you want to approve the <span className="text-emerald-400 font-bold">{approveConfirmItem.amount.toLocaleString()} PKR</span> deposit for <span className="text-white font-bold">{approveConfirmItem.userName}</span>?
            </p>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1 mb-6 text-slate-400">
              <div className="flex justify-between">
                <span>Trx ID:</span>
                <span className="font-mono text-white font-bold">{approveConfirmItem.transactionId}</span>
              </div>
              <div className="flex justify-between">
                <span>Account Status:</span>
                <span className="text-emerald-400 font-bold">Will be Activated</span>
              </div>
              <div className="flex justify-between">
                <span>Commission Distribution:</span>
                <span className="text-blue-400 font-semibold">Tier L1-L4 Triggered</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                disabled={actionLoading}
                onClick={() => setApproveConfirmItem(null)}
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
                <span>Confirm & Approve</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. REJECT REASON MODAL */}
      {rejectItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <div className="w-12 h-12 rounded-2xl bg-rose-600/20 text-rose-400 flex items-center justify-center border border-rose-500/30 mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-white font-display mb-1">
              Reject Payment Proof
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Specify the reason for rejecting deposit for <span className="text-white font-semibold">{rejectItem.userName}</span>.
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
                placeholder="e.g. Transaction ID not found on bank portal, incorrect amount, or unreadable receipt image..."
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 text-xs focus:outline-hidden focus:border-rose-500"
              />

              <div className="flex flex-wrap gap-1.5 pt-1">
                {[
                  'Transaction ID not matching bank statement',
                  'Blurry/unreadable receipt image',
                  'Incorrect deposit amount transferred',
                  'Duplicate proof submission'
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
                <span>Confirm Rejection</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
