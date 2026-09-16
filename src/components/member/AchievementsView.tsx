import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { devStore } from '../../store/devStore';
import { Medal, CheckCircle2, Lock, Sparkles, Star, Award, Zap, Users, Gift, Wallet } from 'lucide-react';

export const AchievementsView: React.FC = () => {
  const { user, profile } = useAuth();

  if (!user || !profile) return null;

  const db = devStore.getData();
  const directTeamCount = db.users.filter(u => u.sponsorId === user.id && u.accountStatus === 'active').length;
  const spinCount = db.spinHistory.filter(s => s.userId === user.id).length;
  const paidWithdrawalCount = db.withdrawals.filter(w => w.userId === user.id && w.status === 'paid').length;

  const badges = [
    {
      id: 'badge-1',
      title: 'DSN Pioneer',
      desc: 'Completed registration on the official DSN platform',
      unlocked: true,
      icon: Sparkles,
      category: 'onboarding'
    },
    {
      id: 'badge-2',
      title: 'Active Networker',
      desc: 'Account activated with approved membership fee',
      unlocked: profile.accountStatus === 'active',
      icon: CheckCircle2,
      category: 'onboarding'
    },
    {
      id: 'badge-3',
      title: 'First Sponsor',
      desc: 'Enrolled your very first direct active team member',
      unlocked: directTeamCount >= 1,
      icon: Users,
      category: 'team'
    },
    {
      id: 'badge-4',
      title: 'Team Builder',
      desc: 'Successfully built a team of 5 or more active members',
      unlocked: profile.totalTeamCount >= 5,
      icon: Users,
      category: 'team'
    },
    {
      id: 'badge-5',
      title: 'Starter Rank',
      desc: 'Accumulated 500 network points in your verified ledger',
      unlocked: profile.currentPoints >= 500,
      icon: Award,
      category: 'rank'
    },
    {
      id: 'badge-6',
      title: 'Silver Achiever',
      desc: 'Reached 1,500 network points milestone',
      unlocked: profile.currentPoints >= 1500,
      icon: Medal,
      category: 'rank'
    },
    {
      id: 'badge-7',
      title: 'Lucky Spinner',
      desc: 'Spun the DSN lucky reward wheel at least once',
      unlocked: spinCount >= 1,
      icon: Gift,
      category: 'rewards'
    },
    {
      id: 'badge-8',
      title: 'First Payout',
      desc: 'Successfully completed and received a withdrawal',
      unlocked: paidWithdrawalCount >= 1,
      icon: Wallet,
      category: 'finance'
    }
  ];

  const unlockedCount = badges.filter(b => b.unlocked).length;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 font-display">
          Achievements & Badges
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Track milestone badges and career accolades as your network grows.
        </p>
      </div>

      {/* Progress Card */}
      <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Milestones Unlocked
          </span>
          <p className="text-2xl font-black text-slate-900 mt-0.5">
            {unlockedCount} of {badges.length} Badges
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
          <Medal className="w-6 h-6" />
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {badges.map(b => {
          const Icon = b.icon;
          return (
            <div
              key={b.id}
              className={`p-6 rounded-3xl border flex flex-col justify-between transition-all ${
                b.unlocked
                  ? 'bg-white border-amber-300 shadow-xs ring-1 ring-amber-400/20'
                  : 'bg-slate-50/70 border-slate-200 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      b.unlocked
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  {b.unlocked ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Unlocked
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      <span>Locked</span>
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-1">{b.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{b.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
