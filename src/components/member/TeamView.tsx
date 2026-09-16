import React, { useState } from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { referralService } from '../../services';
import { Users, Search, Filter, Layers, CheckCircle2, Clock, GitBranch } from 'lucide-react';

export const TeamView: React.FC = () => {
  const { user } = useAuth();
  const [selectedLevel, setSelectedLevel] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'tree'>('list');

  if (!user) return null;

  const team = referralService.getTeam(user.id);

  const filteredMembers = team.allMembers.filter(m => {
    if (selectedLevel !== 'all' && m.level !== selectedLevel) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        m.fullName.toLowerCase().includes(q) ||
        m.referralCode.toLowerCase().includes(q) ||
        m.sponsorName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 font-display">
            My Team Network (4 Levels)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Total Team: <strong className="text-slate-900">{team.counts.total} members</strong> ({team.counts.active} Active, {team.counts.pending} Pending)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'list'
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            Table View
          </button>
          <button
            onClick={() => setViewMode('tree')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'tree'
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            Genealogy Tree
          </button>
        </div>
      </div>

      {/* Level Filter Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        <button
          onClick={() => setSelectedLevel('all')}
          className={`p-3 rounded-2xl border text-left transition-all ${
            selectedLevel === 'all'
              ? 'border-blue-600 bg-blue-50/50 shadow-xs'
              : 'border-slate-200 bg-white hover:bg-slate-50'
          }`}
        >
          <span className="text-[11px] font-bold text-slate-500 uppercase block">All Levels</span>
          <span className="text-lg font-black text-slate-900">{team.counts.total}</span>
        </button>

        <button
          onClick={() => setSelectedLevel(1)}
          className={`p-3 rounded-2xl border text-left transition-all ${
            selectedLevel === 1
              ? 'border-blue-600 bg-blue-50/50 shadow-xs'
              : 'border-slate-200 bg-white hover:bg-slate-50'
          }`}
        >
          <span className="text-[11px] font-bold text-blue-600 uppercase block">Level 1 (Direct)</span>
          <span className="text-lg font-black text-slate-900">{team.counts.l1}</span>
        </button>

        <button
          onClick={() => setSelectedLevel(2)}
          className={`p-3 rounded-2xl border text-left transition-all ${
            selectedLevel === 2
              ? 'border-emerald-600 bg-emerald-50/50 shadow-xs'
              : 'border-slate-200 bg-white hover:bg-slate-50'
          }`}
        >
          <span className="text-[11px] font-bold text-emerald-600 uppercase block">Level 2 (10%)</span>
          <span className="text-lg font-black text-slate-900">{team.counts.l2}</span>
        </button>

        <button
          onClick={() => setSelectedLevel(3)}
          className={`p-3 rounded-2xl border text-left transition-all ${
            selectedLevel === 3
              ? 'border-amber-600 bg-amber-50/50 shadow-xs'
              : 'border-slate-200 bg-white hover:bg-slate-50'
          }`}
        >
          <span className="text-[11px] font-bold text-amber-600 uppercase block">Level 3 (5%)</span>
          <span className="text-lg font-black text-slate-900">{team.counts.l3}</span>
        </button>

        <button
          onClick={() => setSelectedLevel(4)}
          className={`p-3 rounded-2xl border text-left transition-all ${
            selectedLevel === 4
              ? 'border-purple-600 bg-purple-50/50 shadow-xs'
              : 'border-slate-200 bg-white hover:bg-slate-50'
          }`}
        >
          <span className="text-[11px] font-bold text-purple-600 uppercase block">Level 4 (3%)</span>
          <span className="text-lg font-black text-slate-900">{team.counts.l4}</span>
        </button>
      </div>

      {viewMode === 'list' ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Search bar */}
          <div className="p-4 border-b border-slate-200 flex items-center gap-3">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search member by name, code or sponsor..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full text-xs sm:text-sm bg-transparent border-none focus:outline-none text-slate-800"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                  <th className="py-3 px-4">Member Name</th>
                  <th className="py-3 px-4">Referral Code</th>
                  <th className="py-3 px-4">Tier / Level</th>
                  <th className="py-3 px-4">Direct Sponsor</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMembers.map(m => (
                  <tr key={m.userId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {m.fullName}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-blue-600">
                      {m.referralCode}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                          m.level === 1
                            ? 'bg-blue-50 text-blue-700'
                            : m.level === 2
                            ? 'bg-emerald-50 text-emerald-700'
                            : m.level === 3
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-purple-50 text-purple-700'
                        }`}
                      >
                        Level {m.level}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {m.sponsorName}
                    </td>
                    <td className="py-3 px-4">
                      {m.accountStatus === 'active' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-[11px] bg-emerald-50 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-700 font-semibold text-[11px] bg-amber-50 px-2 py-0.5 rounded-full">
                          <Clock className="w-3 h-3" />
                          <span>Pending</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-[11px]">
                      {new Date(m.joinedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}

                {filteredMembers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-400 text-xs">
                      No members found matching your selected criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Visual Genealogy Tree */
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
            <GitBranch className="w-4 h-4 text-blue-600" />
            <span>Genealogy Tree Structure</span>
          </div>

          <div className="p-4 bg-slate-900 text-white rounded-2xl inline-block shadow-md">
            <p className="text-xs text-slate-400 font-medium uppercase">Root / You</p>
            <p className="font-bold text-base mt-0.5">{user.fullName}</p>
            <p className="text-xs font-mono text-blue-300">{user.referralCode}</p>
          </div>

          <div className="pl-6 border-l-2 border-slate-200 space-y-6">
            {/* Level 1 Nodes */}
            {team.levels.l1.map(l1 => (
              <div key={l1.userId} className="space-y-4">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl inline-block">
                  <span className="text-[10px] font-bold text-blue-600 uppercase">Level 1 Direct</span>
                  <p className="font-bold text-slate-900 text-sm">{l1.fullName}</p>
                  <p className="text-xs font-mono text-slate-500">{l1.referralCode} • {l1.accountStatus}</p>
                </div>

                {/* Level 2 children of this l1 */}
                <div className="pl-6 border-l-2 border-blue-200 space-y-3">
                  {team.levels.l2
                    .filter(l2 => l2.sponsorId === l1.userId)
                    .map(l2 => (
                      <div key={l2.userId} className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl inline-block mr-2">
                        <span className="text-[10px] font-bold text-emerald-600 uppercase">Level 2</span>
                        <p className="font-bold text-slate-900 text-sm">{l2.fullName}</p>
                        <p className="text-xs font-mono text-slate-500">{l2.referralCode} • {l2.accountStatus}</p>
                      </div>
                    ))}
                </div>
              </div>
            ))}

            {team.levels.l1.length === 0 && (
              <p className="text-xs text-slate-400">No Level 1 direct team members yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
