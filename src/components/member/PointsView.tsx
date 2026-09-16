import React from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { pointsService } from '../../services';
import { Zap, ShieldCheck, ArrowUpRight, HelpCircle } from 'lucide-react';

export const PointsView: React.FC = () => {
  const { user, profile } = useAuth();

  if (!user || !profile) return null;

  const ledger = pointsService.getLedger(user.id);
  const totalLedgerPoints = pointsService.getTotalPoints(user.id);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 font-display">
          Points Ledger
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Shafaf, ghair-tabdeel shuda (immutable) points record for rank advancements.
        </p>
      </div>

      {/* Summary Box */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Current Points
            </span>
            <span className="text-3xl font-black text-blue-700 mt-1 block">
              {profile.currentPoints.toLocaleString()} <span className="text-xs font-semibold text-slate-500">Pts</span>
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Zap className="w-6 h-6" />
          </div>
        </div>

        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Direct Joins (50 Pts)
          </span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">
            {ledger.filter(l => l.points === 50).length} Activations
          </span>
        </div>

        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Team Joins (25 Pts)
          </span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">
            {ledger.filter(l => l.points === 25).length} Activations
          </span>
        </div>
      </div>

      {/* Immutable Ledger Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Ledger Entries ({ledger.length} items)
          </span>
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Immutable Record</span>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <th className="py-3 px-4">Transaction ID</th>
                <th className="py-3 px-4">Activity Description</th>
                <th className="py-3 px-4">Source Member</th>
                <th className="py-3 px-4">Tier Level</th>
                <th className="py-3 px-4">Points Added</th>
                <th className="py-3 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ledger.map(entry => (
                <tr key={entry.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                    {entry.id}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800">
                    {entry.activity}
                  </td>
                  <td className="py-3 px-4 text-slate-700 font-bold">
                    {entry.sourceUserName || 'Direct Reward'}
                  </td>
                  <td className="py-3 px-4">
                    {entry.level ? (
                      <span className="font-bold px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700">
                        Level {entry.level}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="py-3 px-4 font-extrabold text-blue-700">
                    +{entry.points} Pts
                  </td>
                  <td className="py-3 px-4 text-slate-400 text-xs">
                    {new Date(entry.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}

              {ledger.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400 text-xs">
                    No points entries recorded yet. Points are awarded upon verified member activations.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
