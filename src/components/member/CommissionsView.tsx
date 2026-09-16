import React, { useState } from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { commissionService } from '../../services';
import { DollarSign, CheckCircle2, AlertCircle, ArrowUpRight, Filter } from 'lucide-react';

export const CommissionsView: React.FC = () => {
  const { user } = useAuth();
  const [levelFilter, setLevelFilter] = useState<number | 'all'>('all');

  if (!user) return null;

  const commissions = commissionService.getCommissions(user.id);
  const summary = commissionService.getCommissionSummary(user.id);

  const filtered = commissions.filter(c => {
    if (levelFilter !== 'all' && c.level !== levelFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 font-display">
          Commissions & Earnings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Shafaf 4-tier commission distribution across your verified team activations.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase block">Total Earned</span>
          <span className="text-xl font-black text-slate-900">{summary.total.toLocaleString()} PKR</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-blue-600 uppercase block">Level 1 (20%)</span>
          <span className="text-xl font-black text-blue-700">{summary.byLevel.l1.toLocaleString()} PKR</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-emerald-600 uppercase block">Level 2 (10%)</span>
          <span className="text-xl font-black text-emerald-700">{summary.byLevel.l2.toLocaleString()} PKR</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-amber-600 uppercase block">Level 3 (5%)</span>
          <span className="text-xl font-black text-amber-700">{summary.byLevel.l3.toLocaleString()} PKR</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-purple-600 uppercase block">Level 4 (3%)</span>
          <span className="text-xl font-black text-purple-700">{summary.byLevel.l4.toLocaleString()} PKR</span>
        </div>
      </div>

      {/* Commission Log Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Transactions Log ({filtered.length} entries)
          </span>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 font-semibold mr-1">Filter:</span>
            {['all', 1, 2, 3, 4].map(lvl => (
              <button
                key={lvl}
                onClick={() => setLevelFilter(lvl as any)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  levelFilter === lvl
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {lvl === 'all' ? 'All' : `L${lvl}`}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <th className="py-3 px-4">Transaction ID</th>
                <th className="py-3 px-4">Source Member</th>
                <th className="py-3 px-4">Tier Level</th>
                <th className="py-3 px-4">Rate & Base</th>
                <th className="py-3 px-4">Earned Commission</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(comm => (
                <tr key={comm.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                    {comm.id}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {comm.sourceUserName}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-700">
                      Level {comm.level}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 text-xs">
                    {Math.round(comm.rate * 100)}% of {comm.eligibleAmount} PKR
                  </td>
                  <td className="py-3 px-4 font-extrabold text-emerald-600">
                    +{comm.commission} PKR
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{comm.status}</span>
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400 text-xs">
                    {new Date(comm.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400 text-xs">
                    No commission transactions found for this tier.
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
