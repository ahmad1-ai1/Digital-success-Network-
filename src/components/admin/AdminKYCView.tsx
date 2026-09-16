import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { adminService, kycService } from '../../services';
import { devStore } from '../../store/devStore';
import { ShieldCheck, Check, X, Eye } from 'lucide-react';
import { KYCRecord } from '../../types';

export const AdminKYCView: React.FC = () => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [selectedKyc, setSelectedKyc] = useState<KYCRecord | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showReject, setShowReject] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const db = devStore.getData();
  const allKyc = kycService.getAllKYC();

  const handleApprove = (k: KYCRecord) => {
    if (!user) return;
    setLoading(true);
    const res = adminService.approveKYC(k.id, user.id);
    setLoading(false);

    if (res.success) {
      success(`KYC for ${k.fullName} approved.`);
      setSelectedKyc(null);
      setRefreshTrigger(prev => prev + 1);
    } else {
      error(res.error || 'Failed to approve KYC.');
    }
  };

  const handleReject = () => {
    if (!user || !selectedKyc) return;
    if (!rejectReason.trim()) {
      error('Please provide a reason for rejecting this KYC.');
      return;
    }

    setLoading(true);
    const res = adminService.rejectKYC(selectedKyc.id, user.id, rejectReason.trim());
    setLoading(false);

    if (res.success) {
      success(`KYC for ${selectedKyc.fullName} rejected.`);
      setShowReject(false);
      setSelectedKyc(null);
      setRejectReason('');
      setRefreshTrigger(prev => prev + 1);
    } else {
      error(res.error || 'Failed to reject KYC.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-white font-display">
          Identity Verifications (KYC)
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Review CNIC documents and verify identity compliance for members.
        </p>
      </div>

      {/* Table */}
      <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-900/60 text-slate-400 font-bold border-b border-slate-800">
                <th className="py-3 px-4">Member Name</th>
                <th className="py-3 px-4">CNIC Number</th>
                <th className="py-3 px-4">Date of Birth</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Submitted At</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {allKyc.map(k => (
                <tr key={k.id} className="hover:bg-slate-900/50 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-200">
                    {k.fullName}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-300">
                    {k.cnicNumber}
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    {k.dateOfBirth}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full capitalize ${
                        k.status === 'approved'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : k.status === 'pending'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {k.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500 text-xs">
                    {new Date(k.submittedAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelectedKyc(k)}
                        className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-900 hover:bg-slate-800"
                        title="View KYC Scan"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {k.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(k)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              setSelectedKyc(k);
                              setShowReject(true);
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
              ))}

              {allKyc.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 text-xs">
                    No KYC submissions recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* KYC Viewer Modal */}
      {selectedKyc && !showReject && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white font-display">
                KYC Verification: {selectedKyc.fullName}
              </h2>
              <button onClick={() => setSelectedKyc(null)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between p-3 rounded-xl bg-slate-900">
                <span className="text-slate-400">CNIC Number:</span>
                <span className="font-mono font-bold text-white">{selectedKyc.cnicNumber}</span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="space-y-1">
                  <span className="text-slate-400 block font-semibold">Front Side:</span>
                  <div className="border border-slate-800 rounded-xl overflow-hidden bg-black h-36 flex items-center justify-center">
                    <img src={selectedKyc.frontDocumentUrl} alt="Front" className="h-full object-contain" />
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-400 block font-semibold">Back Side:</span>
                  <div className="border border-slate-800 rounded-xl overflow-hidden bg-black h-36 flex items-center justify-center">
                    <img src={selectedKyc.backDocumentUrl} alt="Back" className="h-full object-contain" />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => setSelectedKyc(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold"
              >
                Close
              </button>
              {selectedKyc.status === 'pending' && (
                <button
                  onClick={() => handleApprove(selectedKyc)}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
                >
                  Approve KYC
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showReject && selectedKyc && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4">
            <h2 className="text-base font-bold text-white font-display">
              Reject KYC Verification
            </h2>
            <textarea
              required
              rows={3}
              placeholder="e.g. CNIC photo is blurry, please upload clear high-resolution scan."
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowReject(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs">
                Cancel
              </button>
              <button onClick={handleReject} className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold">
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
