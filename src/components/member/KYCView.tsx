import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { kycService } from '../../services';
import { ShieldCheck, Upload, CheckCircle2, Clock, XCircle, AlertCircle, FileText } from 'lucide-react';

export const KYCView: React.FC = () => {
  const { user, profile, refreshUser } = useAuth();
  const { success, error } = useToast();

  const [cnicNumber, setCnicNumber] = useState('');
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [dob, setDob] = useState('2000-01-01');
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!user || !profile) return null;

  const currentKYC = kycService.getKYCRecord(user.id);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (side === 'front') setFrontImage(reader.result as string);
        else setBackImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cnicNumber.trim() || !fullName.trim()) {
      error('Please provide valid CNIC number and full name.');
      return;
    }

    setLoading(true);
    const res = await kycService.submitKYC({
      userId: user.id,
      cnicNumber: cnicNumber.trim(),
      fullName: fullName.trim(),
      dateOfBirth: dob,
      frontDocumentUrl: frontImage || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400',
      backDocumentUrl: backImage || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400'
    });
    setLoading(false);

    if (res.success) {
      success('KYC documents submitted for admin verification!');
      refreshUser();
    } else {
      error(res.error || 'Failed to submit KYC.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 font-display">
          Identity Verification (KYC)
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Verify your CNIC identity to protect your account and unlock priority payouts.
        </p>
      </div>

      {/* Current Status Box */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Verification Status
          </span>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`text-lg font-extrabold capitalize ${
                profile.kycStatus === 'approved'
                  ? 'text-emerald-700'
                  : profile.kycStatus === 'pending'
                  ? 'text-amber-600'
                  : profile.kycStatus === 'rejected'
                  ? 'text-rose-600'
                  : 'text-slate-600'
              }`}
            >
              {profile.kycStatus.replace('_', ' ')}
            </span>
          </div>
          {currentKYC?.reviewerNotes && profile.kycStatus === 'rejected' && (
            <p className="text-xs text-rose-600 mt-1 font-semibold">
              Admin Rejection Reason: {currentKYC.reviewerNotes}
            </p>
          )}
        </div>

        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-slate-50 border border-slate-200">
          {profile.kycStatus === 'approved' && <CheckCircle2 className="w-6 h-6 text-emerald-600" />}
          {profile.kycStatus === 'pending' && <Clock className="w-6 h-6 text-amber-500" />}
          {profile.kycStatus === 'rejected' && <XCircle className="w-6 h-6 text-rose-500" />}
          {profile.kycStatus === 'not_submitted' && <FileText className="w-6 h-6 text-slate-400" />}
        </div>
      </div>

      {/* Form or Verified Banner */}
      {profile.kycStatus === 'approved' ? (
        <div className="p-8 bg-emerald-50 border border-emerald-200 rounded-3xl text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
          <h2 className="text-xl font-bold text-emerald-950 font-display">
            Your CNIC Identity is Verified
          </h2>
          <p className="text-xs text-emerald-800 max-w-md mx-auto leading-relaxed">
            Your account is compliant with DSN verification guidelines. No further action is required.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 font-display mb-4">
            {profile.kycStatus === 'pending' ? 'Update KYC Submission' : 'Submit CNIC Information'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Legal Name (as per CNIC) *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  CNIC Number (13 Digits) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="35201-1234567-1"
                  value={cnicNumber}
                  onChange={e => setCnicNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Date of Birth *
              </label>
              <input
                type="date"
                required
                value={dob}
                onChange={e => setDob(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 border-2 border-dashed border-slate-200 rounded-2xl text-center space-y-2">
                <Upload className="w-6 h-6 text-slate-400 mx-auto" />
                <span className="text-xs font-bold text-slate-700 block">CNIC Front Side</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => handleFileUpload(e, 'front')}
                  className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {frontImage && <span className="text-[11px] text-emerald-600 font-bold block">Front Image Selected ✓</span>}
              </div>

              <div className="p-4 border-2 border-dashed border-slate-200 rounded-2xl text-center space-y-2">
                <Upload className="w-6 h-6 text-slate-400 mx-auto" />
                <span className="text-xs font-bold text-slate-700 block">CNIC Back Side</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => handleFileUpload(e, 'back')}
                  className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {backImage && <span className="text-[11px] text-emerald-600 font-bold block">Back Image Selected ✓</span>}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Submitting...' : 'Submit Documents for Review'}</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
