import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { adminService, paymentService } from '../../services';
import { devStore } from '../../store/devStore';
import { CheckCircle2, XCircle, Eye, Receipt, Clock, AlertCircle, Filter, Check } from 'lucide-react';
import { PaymentProof } from '../../types';

export const AdminPaymentsView: React.FC = () => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [selectedProof, setSelectedProof] = useState<PaymentProof | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const db = devStore.getData();
  const allProofs = paymentService.getAllProofs();

  const filteredProofs = allProofs.filter(p => {
    if (filter === 'all') return true;
    return p.status === filter;
  });

  const handleApprove = (proof: PaymentProof) => {
    if (!user) return;
    setLoading(true);
    const res = adminService.approvePayment(proof.id, user.id);
    setLoading(false);

    if (res.success) {
      success(`Payment ${proof.transactionId} approved! Member activated and commissions/points/spin distributed.`);
      setRefreshTrigger(prev => prev + 1);
      setSelectedProof(null);
    } else {
      error(res.error || 'Failed to approve payment.');
    }
  };

  const handleReject = () => {
    if (!user || !selectedProof) return;
    if (!rejectionReason.trim()) {
      error('Please provide a reason for rejecting the payment proof.');
      return;
    }

    setLoading(true);
    const res = adminService.rejectPayment(selectedProof.id, user.id, rejectionReason.trim());
    setLoading(false);

    if (res.success) {
      success(`Payment ${selectedProof.transactionId} rejected.`);
      setRejectModalOpen(false);
      setRejectionReason('');
      setSelectedProof(null);
      setRefreshTrigger(prev => prev + 1);
    } else {
      error(res.error || 'Failed to reject payment.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white font-display">
            Payment Proof Verifications
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Review submitted transaction IDs, verify deposits, and trigger automatic distribution.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs">
          {(['pending', 'approved', 'rejected', 'all'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-xl font-bold capitalize transition-all ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white'
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
                <th className="py-3 px-4">Trx ID</th>
                <th className="py-3 px-4">Member Name</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Method & Sender</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredProofs.map(p => {
                const member = db.users.find(u => u.id === p.userId);

                return (
                  <tr key={p.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-white">
                      {p.transactionId}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-200">{member?.fullName || p.senderName}</p>
                      <p className="text-[11px] font-mono text-slate-500">{member?.email}</p>
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-400">
                      {p.amount.toLocaleString()} PKR
                    </td>
                    <td className="py-3 px-4">
                      <span className="capitalize font-semibold text-slate-300 block">
                        {p.paymentMethod.replace('_', ' ')}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">
                        {p.senderAccount} ({p.senderName})
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full capitalize ${
                          p.status === 'approved'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : p.status === 'pending'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-xs">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedProof(p)}
                          className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-900 hover:bg-slate-800"
                          title="View Proof Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {p.status === 'pending' && (
                          <>
                            <button
                              disabled={loading}
                              onClick={() => handleApprove(p)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow-xs"
                            >
                              <Check className="w-3 h-3" />
                              <span>Approve</span>
                            </button>
                            <button
                              disabled={loading}
                              onClick={() => {
                                setSelectedProof(p);
                                setRejectModalOpen(true);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredProofs.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 text-xs">
                    No payment submissions found in this category.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Proof Detail Modal */}
      {selectedProof && !rejectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white font-display">
                Payment Proof Details
              </h2>
              <button onClick={() => setSelectedProof(null)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between p-3 rounded-xl bg-slate-900">
                <span className="text-slate-400">Transaction ID:</span>
                <span className="font-mono font-bold text-white">{selectedProof.transactionId}</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-slate-900">
                <span className="text-slate-400">Amount:</span>
                <span className="font-bold text-emerald-400">{selectedProof.amount} PKR</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-slate-900">
                <span className="text-slate-400">Sender Account:</span>
                <span className="font-mono text-slate-200">{selectedProof.senderAccount} ({selectedProof.senderName})</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-slate-900">
                <span className="text-slate-400">Method:</span>
                <span className="capitalize text-slate-200">{selectedProof.paymentMethod.replace('_', ' ')}</span>
              </div>

              {selectedProof.notes && (
                <div className="p-3 rounded-xl bg-slate-900 text-slate-300">
                  <span className="text-slate-400 block mb-1">User Note:</span>
                  {selectedProof.notes}
                </div>
              )}

              {selectedProof.receiptUrl && (
                <div className="mt-2 space-y-1">
                  <span className="text-slate-400 font-bold block">Attached Receipt:</span>
                  <div className="rounded-2xl overflow-hidden border border-slate-800 max-h-56 bg-black flex items-center justify-center">
                    <img
                      src={selectedProof.receiptUrl}
                      alt="Receipt Proof"
                      className="max-h-56 object-contain"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => setSelectedProof(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold"
              >
                Close
              </button>
              {selectedProof.status === 'pending' && (
                <button
                  onClick={() => handleApprove(selectedProof)}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
                >
                  Approve & Activate
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalOpen && selectedProof && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4">
            <h2 className="text-base font-bold text-white font-display">
              Reject Payment Submission
            </h2>
            <p className="text-xs text-slate-400">
              Please enter an explanatory reason that will be visible to member <strong>{selectedProof.senderName}</strong>.
            </p>

            <textarea
              required
              rows={3}
              placeholder="e.g. Transaction ID not found in bank statement, please resubmit valid proof."
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
              className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setRejectModalOpen(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={loading}
                className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
