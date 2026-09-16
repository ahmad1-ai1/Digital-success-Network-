import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { memberService } from '../../services';
import { User, Phone, Mail, Shield, Save, CheckCircle2 } from 'lucide-react';

export const ProfileView: React.FC = () => {
  const { user, profile, refreshUser } = useAuth();
  const { success, error } = useToast();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [emailNotify, setEmailNotify] = useState(profile?.notificationPreferences.email ?? true);
  const [smsNotify, setSmsNotify] = useState(profile?.notificationPreferences.sms ?? false);
  const [inAppNotify, setInAppNotify] = useState(profile?.notificationPreferences.inApp ?? true);
  const [loading, setLoading] = useState(false);

  if (!user || !profile) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) {
      error('Full Name and Phone are required.');
      return;
    }

    setLoading(true);
    const res = await memberService.updateProfile(user.id, {
      fullName: fullName.trim(),
      phone: phone.trim(),
      notificationPreferences: {
        email: emailNotify,
        sms: smsNotify,
        inApp: inAppNotify
      }
    });
    setLoading(false);

    if (res.success) {
      success('Profile details updated successfully.');
      refreshUser();
    } else {
      error(res.error || 'Failed to update profile.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 font-display">
          Profile & Security Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage your personal contact details and communication preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Poora Naam (Full Name) *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Phone Number / WhatsApp *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email Address (Permanent Account Identifier)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  readOnly
                  disabled
                  value={user.email}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Email is protected and cannot be changed without contacting Central Admin.
              </p>
            </div>

            {/* Notification Preferences */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Notification Preferences
              </h3>

              <div className="space-y-2 text-xs text-slate-700">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailNotify}
                    onChange={e => setEmailNotify(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span>Email notifications for new team registrations & commissions</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inAppNotify}
                    onChange={e => setInAppNotify(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span>In-app dashboard alerts for rank achievements & payouts</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </form>
        </div>

        {/* Read-Only Account Identity Card */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 font-display">
              Permanent Network Metadata
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between p-3 rounded-xl bg-slate-50">
                <span className="text-slate-500">Your Referral Code:</span>
                <span className="font-mono font-bold text-blue-600">{user.referralCode}</span>
              </div>

              <div className="flex justify-between p-3 rounded-xl bg-slate-50">
                <span className="text-slate-500">Sponsor Code:</span>
                <span className="font-mono font-bold text-slate-800">{user.sponsorCode || 'Root / Direct'}</span>
              </div>

              <div className="flex justify-between p-3 rounded-xl bg-slate-50">
                <span className="text-slate-500">Current Rank:</span>
                <span className="font-bold text-amber-600">{profile.currentRank}</span>
              </div>

              <div className="flex justify-between p-3 rounded-xl bg-slate-50">
                <span className="text-slate-500">Member ID:</span>
                <span className="font-mono text-slate-400">{user.id}</span>
              </div>

              <div className="flex justify-between p-3 rounded-xl bg-slate-50">
                <span className="text-slate-500">Registration Date:</span>
                <span className="text-slate-700">{new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
