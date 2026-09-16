import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { devStore } from '../../store/devStore';
import { Trophy, Medal, Award, Star, Users } from 'lucide-react';

export const LeaderboardView: React.FC = () => {
  const { user } = useAuth();
  const db = devStore.getData();

  // Sort active members by points
  const membersList = db.users
    .filter(u => u.role === 'member')
    .map(u => {
      const p = db.profiles[u.id];
      const directCount = db.users.filter(other => other.sponsorId === u.id && other.accountStatus === 'active').length;
      return {
        id: u.id,
        name: u.fullName,
        referralCode: u.referralCode,
        points: p?.currentPoints ?? 0,
        rank: p?.currentRank ?? 'Starter',
        directCount,
        isCurrentUser: u.id === user?.id
      };
    })
    .sort((a, b) => b.points - a.points);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 font-display">
          Network Leaderboard
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Recognizing top network builders based on verified points and team development.
        </p>
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
        {membersList.slice(0, 3).map((top, idx) => {
          const podiumStyles = [
            { bg: 'bg-amber-500/10 border-amber-300', text: 'text-amber-700', badge: '1st Place', icon: Trophy },
            { bg: 'bg-slate-200/50 border-slate-300', text: 'text-slate-700', badge: '2nd Place', icon: Medal },
            { bg: 'bg-amber-700/10 border-amber-600/30', text: 'text-amber-800', badge: '3rd Place', icon: Award }
          ][idx];

          const Icon = podiumStyles.icon;

          return (
            <div
              key={top.id}
              className={`p-6 rounded-3xl border ${podiumStyles.bg} text-center space-y-3 shadow-xs relative`}
            >
              <div className="inline-flex p-3 rounded-2xl bg-white shadow-xs mx-auto">
                <Icon className={`w-8 h-8 ${podiumStyles.text}`} />
              </div>
              <span className={`text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${podiumStyles.bg} ${podiumStyles.text}`}>
                {podiumStyles.badge}
              </span>
              <h3 className="text-lg font-bold text-slate-900 truncate">{top.name}</h3>
              <p className="text-2xl font-black text-slate-900">
                {top.points.toLocaleString()} <span className="text-xs font-semibold text-slate-500">Pts</span>
              </p>
              <div className="text-xs text-slate-500 flex items-center justify-center gap-2">
                <span>{top.rank}</span>
                <span>•</span>
                <span>{top.directCount} Direct Team</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            All Network Rankings
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <th className="py-3 px-4">Rank #</th>
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-4">Network Tier</th>
                <th className="py-3 px-4">Direct Team</th>
                <th className="py-3 px-4 text-right">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {membersList.map((m, index) => (
                <tr
                  key={m.id}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    m.isCurrentUser ? 'bg-blue-50/60 font-bold' : ''
                  }`}
                >
                  <td className="py-3 px-4 font-extrabold text-slate-900">
                    #{index + 1}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{m.name}</span>
                      {m.isCurrentUser && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-600 text-white">
                          You
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">{m.referralCode}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {m.rank}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {m.directCount} members
                  </td>
                  <td className="py-3 px-4 text-right font-black text-blue-700">
                    {m.points.toLocaleString()} Pts
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
