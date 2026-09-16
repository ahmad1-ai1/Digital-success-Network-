import React from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { rankService } from '../../services';
import { Award, CheckCircle2, Lock, Sparkles, TrendingUp } from 'lucide-react';

export const RankView: React.FC = () => {
  const { profile } = useAuth();

  if (!profile) return null;

  const thresholds = rankService.getRankThresholds();
  const progress = rankService.getRankProgress(profile.currentPoints);

  const ranksList = [
    { name: 'Starter', points: thresholds.Starter, desc: 'Entry rank upon reaching 500 network points' },
    { name: 'Silver', points: thresholds.Silver, desc: 'Established team builder with 1,500 points' },
    { name: 'Gold', points: thresholds.Gold, desc: 'Community leader with 3,000 network points' },
    { name: 'Platinum', points: thresholds.Platinum, desc: 'Senior mentor with 5,000 verified points' },
    { name: 'Diamond', points: thresholds.Diamond, desc: 'Elite network architect with 8,000 points' },
    { name: 'Crown', points: thresholds.Crown, desc: 'Top tier network director with 10,000+ points' }
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 font-display">
          Rank Status & Career Progression
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Shafaf points-based rank advancement ladder (Starter to Crown).
        </p>
      </div>

      {/* Current Rank Banner */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white rounded-3xl p-6 sm:p-8 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold text-blue-200 uppercase tracking-wider">
            Current Tier Status
          </span>
          <div className="flex items-center gap-3 mt-1">
            <h2 className="text-3xl sm:text-4xl font-black font-display tracking-tight">
              {profile.currentRank}
            </h2>
            <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider backdrop-blur-xs">
              {profile.currentPoints} Total Points
            </span>
          </div>
          <p className="text-xs sm:text-sm text-blue-100 mt-2 max-w-lg">
            {progress.nextRank
              ? `You need ${progress.neededPoints} more points to achieve ${progress.nextRank} rank.`
              : 'You have achieved the highest rank in Digital Success Network!'}
          </p>
        </div>

        <div className="w-full md:w-64 bg-white/10 rounded-2xl p-4 border border-white/20">
          <div className="flex justify-between text-xs font-semibold text-blue-100 mb-1.5">
            <span>Progress to Next</span>
            <span>{Math.round(progress.progressPercent)}%</span>
          </div>
          <div className="w-full bg-black/20 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-emerald-400 h-full rounded-full transition-all"
              style={{ width: `${Math.min(100, Math.max(5, progress.progressPercent))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Ranks Ladder */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 font-display">
          All Network Ranks & Thresholds
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ranksList.map(r => {
            const isAchieved = profile.currentPoints >= r.points;
            const isCurrent = profile.currentRank === r.name;

            return (
              <div
                key={r.name}
                className={`p-6 rounded-3xl border transition-all ${
                  isCurrent
                    ? 'bg-blue-50/70 border-blue-500 shadow-sm ring-2 ring-blue-500/20'
                    : isAchieved
                    ? 'bg-white border-emerald-300 shadow-xs'
                    : 'bg-slate-50/70 border-slate-200 opacity-75'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                    {r.points.toLocaleString()} Points
                  </span>
                  {isCurrent ? (
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-600 text-white">
                      Current Rank
                    </span>
                  ) : isAchieved ? (
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Unlocked</span>
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-600 flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      <span>Locked</span>
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-black text-slate-900 font-display mb-1">{r.name}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{r.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
