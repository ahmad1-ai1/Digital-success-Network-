import React, { useState } from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { referralService } from '../../services';
import {
  Share2,
  Copy,
  CheckCircle2,
  Users,
  QrCode,
  MousePointerClick,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export const ReferralView: React.FC = () => {
  const { user } = useAuth();
  const { success } = useToast();

  if (!user) return null;

  const referralData = referralService.getReferralData(user.id);
  const fullLink = referralData.referralLink;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(fullLink);
    success(`Referral link copied: ${fullLink}`);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(user.referralCode);
    success(`Referral code copied: ${user.referralCode}`);
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(
      `Assalam o Alaikum! Digital Success Network (DSN) par meri team ka hissa banein. Join using my referral link: ${fullLink}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 font-display">
          My Referral Link & Tools
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Share your verified code to expand your network across 4 multi-level tiers.
        </p>
      </div>

      {/* Main Link Box */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Your Unique Referral Link
          </label>
          <div className="flex flex-col sm:flex-row items-stretch gap-2">
            <input
              type="text"
              readOnly
              value={fullLink}
              className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono text-slate-800 select-all focus:outline-none"
            />
            <button
              onClick={handleCopyLink}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xs flex items-center justify-center gap-2"
            >
              <Copy className="w-4 h-4" />
              <span>Copy Link</span>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-500">Your Code:</span>
            <span className="text-sm font-black font-mono px-3 py-1 bg-blue-50 text-blue-700 rounded-lg border border-blue-200">
              {user.referralCode}
            </span>
            <button
              onClick={handleCopyCode}
              className="text-xs text-blue-600 font-bold hover:underline"
            >
              Copy Code
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleWhatsApp}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share on WhatsApp</span>
            </button>
          </div>
        </div>
      </div>

      {/* Referral Analytics Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase">Total Clicks</span>
            <MousePointerClick className="w-4 h-4 text-blue-500" />
          </div>
          <span className="text-2xl font-black text-slate-900">{referralData.stats.clicks}</span>
          <p className="text-[11px] text-slate-400 mt-1">Visitors via your link</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase">Signups</span>
            <Users className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="text-2xl font-black text-slate-900">{referralData.stats.signups}</span>
          <p className="text-[11px] text-slate-400 mt-1">Total registered users</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase">Active Conversions</span>
            <CheckCircle2 className="w-4 h-4 text-purple-500" />
          </div>
          <span className="text-2xl font-black text-purple-700">{referralData.stats.activations}</span>
          <p className="text-[11px] text-slate-400 mt-1">Paid and approved</p>
        </div>
      </div>

      {/* Policy Reminder */}
      <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-xs text-amber-900">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold mb-0.5">Important Referral Policy:</p>
          <p className="leading-relaxed">
            Please inform your invitees that they must submit their activation payment proof in order to activate their accounts. You will receive 20% commission (200 PKR), 50 points, and 1 Lucky Spin Credit immediately upon their activation verification.
          </p>
        </div>
      </div>
    </div>
  );
};
