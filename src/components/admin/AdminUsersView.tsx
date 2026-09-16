import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { adminService } from '../../services';
import { devStore } from '../../store/devStore';
import { Users, Search, CheckCircle2, Clock, Shield, UserCheck, UserX } from 'lucide-react';

export const AdminUsersView: React.FC = () => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending_activation' | 'suspended'>('all');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const db = devStore.getData();
  const users = adminService.getUsers();

  const filtered = users.filter(u => {
    if (statusFilter !== 'all' && u.accountStatus !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.referralCode.toLowerCase().includes(q) ||
        (u.phone && u.phone.includes(q))
      );
    }
    return true;
  });

  const toggleUserStatus = (targetUserId: string, currentStatus: string) => {
    if (!user) return;
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    const res = adminService.updateUserStatus(targetUserId, newStatus as any, user.id);
    if (res.success) {
      success(`User status updated to ${newStatus}.`);
      setRefreshTrigger(prev => prev + 1);
    } else {
      error(res.error || 'Failed to update user status.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white font-display">
            User Accounts & Members
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Browse and manage all {users.length} registered accounts across the platform.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs">
          {(['all', 'active', 'pending_activation', 'suspended'] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded-xl font-bold capitalize transition-all ${
                statusFilter === s ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Table with Search */}
      <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-800 flex items-center gap-3">
          <Search className="w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by full name, email, referral code, or phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-transparent border-none text-xs sm:text-sm text-white focus:outline-none placeholder-slate-500"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-900/60 text-slate-400 font-bold border-b border-slate-800">
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-4">Ref Code</th>
                <th className="py-3 px-4">Sponsor</th>
                <th className="py-3 px-4">Rank & Points</th>
                <th className="py-3 px-4">Available Balance</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filtered.map(u => {
                const profile = db.profiles[u.id];

                return (
                  <tr key={u.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{u.fullName}</span>
                        {u.role === 'admin' && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                            Admin
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500 block">{u.email}</span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-blue-400">
                      {u.referralCode}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400 text-xs">
                      {u.sponsorCode || 'Root'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-200 block text-xs">
                        {profile?.currentRank || 'Starter'}
                      </span>
                      <span className="text-[11px] text-blue-400 font-bold">
                        {profile?.currentPoints || 0} Pts
                      </span>
                    </td>
                    <td className="py-3 px-4 font-black text-emerald-400">
                      {profile?.availableBalance.toLocaleString() || 0} PKR
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full capitalize ${
                          u.accountStatus === 'active'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : u.accountStatus === 'pending_activation'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {u.accountStatus.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => toggleUserStatus(u.id, u.accountStatus)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                            u.accountStatus === 'active'
                              ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                              : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                          }`}
                        >
                          {u.accountStatus === 'active' ? 'Suspend' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 text-xs">
                    No users matching criteria.
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
