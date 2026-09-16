import React from 'react';
import { useNavigation } from '../../context/NavigationContext';
import { adminService } from '../../services';
import {
  Users,
  CheckCircle2,
  Clock,
  DollarSign,
  Wallet,
  Receipt,
  ArrowRight,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';

export const AdminOverview: React.FC = () => {
  const { navigate } = useNavigation();
  const stats = adminService.getStats();

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-white font-display">
          Operations Command Center
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          High-level network volume, activations, and financial distributions.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Members</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <span className="text-2xl font-black text-white">{stats.totalUsers}</span>
          <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
            <span className="text-emerald-400 font-bold">{stats.activeUsers} Active</span>
            <span>•</span>
            <span className="text-amber-400 font-bold">{stats.pendingUsers} Pending</span>
          </div>
        </div>

        <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Approvals</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-2xl font-black text-amber-400">{stats.pendingPayments}</span>
          <p className="text-xs text-slate-400 mt-2">
            Activation proofs waiting for verification
          </p>
        </div>

        <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Payouts</span>
            <Wallet className="w-4 h-4 text-rose-400" />
          </div>
          <span className="text-2xl font-black text-rose-400">{stats.pendingWithdrawals}</span>
          <p className="text-xs text-slate-400 mt-2">
            Withdrawal requests to be disbursed
          </p>
        </div>

        <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Commissions Paid</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-2xl font-black text-emerald-400">
            {stats.totalCommissionsPaid.toLocaleString()} <span className="text-xs font-medium text-slate-400">PKR</span>
          </span>
          <p className="text-xs text-slate-400 mt-2">
            Distributed across multi-level tiers
          </p>
        </div>
      </div>

      {/* Quick Action Hub */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => navigate('/admin/payments')}
          className="p-5 bg-slate-950 border border-slate-800 hover:border-blue-500 rounded-2xl text-left transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <Receipt className="w-6 h-6 text-blue-400" />
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
          </div>
          <h2 className="font-bold text-sm text-white">Review Payments</h2>
          <p className="text-xs text-slate-400 mt-1">
            Verify transaction IDs & activate members ({stats.pendingPayments} pending)
          </p>
        </button>

        <button
          onClick={() => navigate('/admin/withdrawals')}
          className="p-5 bg-slate-950 border border-slate-800 hover:border-emerald-500 rounded-2xl text-left transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <Wallet className="w-6 h-6 text-emerald-400" />
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
          </div>
          <h2 className="font-bold text-sm text-white">Process Withdrawals</h2>
          <p className="text-xs text-slate-400 mt-1">
            Disburse earnings to JazzCash, EasyPaisa, or Bank ({stats.pendingWithdrawals} pending)
          </p>
        </button>

        <button
          onClick={() => navigate('/admin/kyc')}
          className="p-5 bg-slate-950 border border-slate-800 hover:border-purple-500 rounded-2xl text-left transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <ShieldCheck className="w-6 h-6 text-purple-400" />
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
          </div>
          <h2 className="font-bold text-sm text-white">Verify KYC</h2>
          <p className="text-xs text-slate-400 mt-1">
            Review CNIC scans & approve compliant members
          </p>
        </button>
      </div>
    </div>
  );
};
