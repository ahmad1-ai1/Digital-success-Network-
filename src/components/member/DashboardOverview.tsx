import React from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import { useNavigation } from '../../context/NavigationContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { memberService, rankService } from '../../services';
import {
  Wallet,
  Zap,
  Users,
  Gift,
  Share2,
  Copy,
  ArrowRight,
  TrendingUp,
  Award,
  AlertCircle,
  CheckCircle2,
  Clock,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

export const DashboardOverview: React.FC = () => {
  const { t, language } = useTranslation();
  const { navigate } = useNavigation();
  const { user, profile } = useAuth();
  const { success } = useToast();

  if (!user || !profile) return null;

  const summary = memberService.getDashboardSummary(user.id);
  const rankProgress = rankService.getRankProgress(profile.currentPoints);

  const handleCopyLink = () => {
    const fullLink = `${window.location.origin}/register?ref=${encodeURIComponent(user.referralCode)}`;
    navigator.clipboard.writeText(fullLink);
    success(`Referral link copied: ${fullLink}`);
  };

  const handleWhatsAppShare = () => {
    const fullLink = `${window.location.origin}/register?ref=${encodeURIComponent(user.referralCode)}`;
    const text = encodeURIComponent(
      `Assalam o Alaikum! Join Digital Success Network (DSN) - "Team Se Taraqqi Tak". Register here: ${fullLink}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
            Member Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display mt-1">
            Khush Amdeed, {user.fullName}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Apni team ki kargardagi, commissions aur rank progress ka jaiza lein.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl border border-blue-200 transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy Link ({user.referralCode})</span>
          </button>
          <button
            onClick={handleWhatsAppShare}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors shadow-xs"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share WhatsApp</span>
          </button>
        </div>
      </div>

      {/* 4 Core Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Available Balance */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">{t('statBalance')}</span>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900">
              {profile.availableBalance.toLocaleString()} <span className="text-xs font-semibold text-slate-500">PKR</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5 leading-snug">
              Yeh aapki available earning hai jo aap withdraw kar sakte hain.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400">Total Earned: {profile.totalEarnings.toLocaleString()} PKR</span>
            <button
              onClick={() => navigate('/dashboard/withdrawals')}
              className="text-emerald-600 font-bold hover:underline"
            >
              Withdraw →
            </button>
          </div>
        </div>

        {/* Current Points */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">{t('statPoints')}</span>
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                <Zap className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900">
              {profile.currentPoints.toLocaleString()} <span className="text-xs font-semibold text-slate-500">Pts</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5 leading-snug">
              Yeh aapke team activities aur eligible joining se milne wale points hain.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-semibold">{profile.currentRank} Tier</span>
            <button
              onClick={() => navigate('/dashboard/points')}
              className="text-blue-600 font-bold hover:underline"
            >
              Ledger →
            </button>
          </div>
        </div>

        {/* Total Team Count */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">{t('statTeam')}</span>
              <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900">
              {summary?.teamStats.activeCount ?? 0}{' '}
              <span className="text-xs font-semibold text-slate-500">Active Members</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5 leading-snug">
              Yeh aapki direct aur poori team mein shamil members ki tadaad hai.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Direct (L1): {summary?.teamStats.l1Count ?? 0}</span>
            <button
              onClick={() => navigate('/dashboard/team')}
              className="text-purple-600 font-bold hover:underline"
            >
              Network →
            </button>
          </div>
        </div>

        {/* Lucky Spin Credits */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">{t('statSpins')}</span>
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                <Gift className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900">
              {profile.spinCredits} <span className="text-xs font-semibold text-slate-500">Credits</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5 leading-snug">
              Yeh aapke available Lucky Spins hain jo eligible joining par milte hain.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400">1 free per direct joining</span>
            <button
              onClick={() => navigate('/dashboard/spin')}
              className="text-amber-600 font-bold hover:underline"
            >
              Play Spin →
            </button>
          </div>
        </div>
      </div>

      {/* Rank Progress Bar Widget */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <span className="text-sm font-bold text-slate-900">
              Rank Progress: <span className="text-blue-600">{rankProgress.currentRank}</span>
            </span>
          </div>
          <span className="text-xs font-bold text-slate-500">
            {rankProgress.nextRank
              ? `${rankProgress.neededPoints} points needed for ${rankProgress.nextRank}`
              : 'Maximum Crown Rank Reached!'}
          </span>
        </div>

        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-600 to-emerald-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(5, rankProgress.progressPercent))}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
          <span>Current: {profile.currentPoints} Pts</span>
          <span>Next Milestone: {rankProgress.nextThreshold} Pts</span>
        </div>
      </div>

      {/* Two Column Section: Recent Commissions & Team Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Commissions */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 font-display">
              Recent Commission History
            </h2>
            <button
              onClick={() => navigate('/dashboard/commissions')}
              className="text-xs text-blue-600 font-bold hover:underline"
            >
              View All →
            </button>
          </div>

          {summary?.recentCommissions && summary.recentCommissions.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {summary.recentCommissions.map(comm => (
                <div key={comm.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">
                        {comm.sourceUserName}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-bold text-[10px]">
                        Level {comm.level}
                      </span>
                    </div>
                    <span className="text-slate-400 text-[11px]">
                      {new Date(comm.createdAt).toLocaleDateString()} • {Math.round(comm.rate * 100)}% on {comm.eligibleAmount} PKR
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-emerald-600 text-sm block">
                      +{comm.commission} PKR
                    </span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">
                      {comm.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-500">
              No commission transactions recorded yet. Commissions will appear as your team members activate.
            </div>
          )}
        </div>

        {/* Team Network Levels Breakdown */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 font-display">
              Team Structure (4 Levels)
            </h2>
            <button
              onClick={() => navigate('/dashboard/team')}
              className="text-xs text-blue-600 font-bold hover:underline"
            >
              Details →
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[11px]">
                  L1
                </span>
                <span className="font-semibold text-slate-700">Direct Referrals (20%)</span>
              </div>
              <span className="font-bold text-slate-900">{summary?.teamStats.l1Count ?? 0} members</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-[11px]">
                  L2
                </span>
                <span className="font-semibold text-slate-700">Level 2 Network (10%)</span>
              </div>
              <span className="font-bold text-slate-900">{summary?.teamStats.l2Count ?? 0} members</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-700 font-bold flex items-center justify-center text-[11px]">
                  L3
                </span>
                <span className="font-semibold text-slate-700">Level 3 Depth (5%)</span>
              </div>
              <span className="font-bold text-slate-900">{summary?.teamStats.l3Count ?? 0} members</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-[11px]">
                  L4
                </span>
                <span className="font-semibold text-slate-700">Level 4 Scale (3%)</span>
              </div>
              <span className="font-bold text-slate-900">{summary?.teamStats.l4Count ?? 0} members</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
