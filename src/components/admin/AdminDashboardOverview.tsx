import React, { useState, useEffect } from 'react';
import { useNavigation } from '../../context/NavigationContext';
import { adminPortalService, DashboardSummary, AdminActivity } from '../../services/adminPortalService';
import {
  DollarSign,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  XCircle,
  FileCheck,
  Wallet,
  Users,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Receipt
} from 'lucide-react';

interface AdminDashboardOverviewProps {
  onNavigateTab: (tab: 'dashboard' | 'deposits' | 'withdrawals') => void;
}

export const AdminDashboardOverview: React.FC<AdminDashboardOverviewProps> = ({ onNavigateTab }) => {
  const { navigate } = useNavigation();
  const [summary, setSummary] = useState<DashboardSummary>(() => adminPortalService.getDashboardSummary());
  const [activities, setActivities] = useState<AdminActivity[]>(() => adminPortalService.getRecentActivities());

  useEffect(() => {
    // Refresh stats when component mounts and fetch from Supabase
    setSummary(adminPortalService.getDashboardSummary());
    setActivities(adminPortalService.getRecentActivities());

    adminPortalService.loadFromSupabase().then(() => {
      setSummary(adminPortalService.getDashboardSummary());
      setActivities(adminPortalService.getRecentActivities());
    });
  }, []);

  const formatPKR = (val: number) => {
    return val.toLocaleString('en-PK') + ' PKR';
  };

  const getActivityIcon = (type: AdminActivity['type']) => {
    switch (type) {
      case 'deposit_uploaded':
        return <Receipt className="w-4 h-4 text-blue-400" />;
      case 'deposit_approved':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'deposit_rejected':
        return <XCircle className="w-4 h-4 text-rose-400" />;
      case 'withdrawal_requested':
        return <Wallet className="w-4 h-4 text-amber-400" />;
      case 'withdrawal_approved':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'withdrawal_rejected':
        return <XCircle className="w-4 h-4 text-rose-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-slate-400" />;
    }
  };

  const getActivityBadge = (type: AdminActivity['type']) => {
    switch (type) {
      case 'deposit_uploaded':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">New Deposit</span>;
      case 'deposit_approved':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Deposit Approved</span>;
      case 'deposit_rejected':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20">Deposit Rejected</span>;
      case 'withdrawal_requested':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">New Withdrawal</span>;
      case 'withdrawal_approved':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Payout Completed</span>;
      case 'withdrawal_rejected':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20">Payout Rejected</span>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display">
            Admin Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time financial verification, payment proofs overview, and withdrawal queues.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold">DSN Live Operations</span>
          </div>
        </div>
      </div>

      {/* 4 Summary Cards as explicitly specified: Total Deposits, Pending Deposits, Total Withdrawals, Pending Withdrawals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Deposits */}
        <div className="bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 transition-all shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Deposits</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-display">
            {formatPKR(summary.totalDepositsAmount)}
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800/80 text-xs">
            <span className="text-slate-400">{summary.totalDepositsCount} Approved Records</span>
            <button
              onClick={() => onNavigateTab('deposits')}
              className="text-blue-400 hover:text-blue-300 font-semibold inline-flex items-center gap-1 cursor-pointer"
            >
              <span>View</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Pending Deposits */}
        <div className="bg-slate-900/90 border border-amber-500/30 hover:border-amber-500/50 rounded-2xl p-5 transition-all shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400/90">Pending Deposits</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-400 font-display">
            {summary.pendingDepositsCount} <span className="text-xs font-semibold text-slate-400">Requests</span>
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800/80 text-xs">
            <span className="text-slate-400">{formatPKR(summary.pendingDepositsAmount)} awaiting</span>
            <button
              onClick={() => onNavigateTab('deposits')}
              className="text-amber-400 hover:text-amber-300 font-bold inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Review Proofs</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Total Withdrawals */}
        <div className="bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 transition-all shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Withdrawals</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-display">
            {formatPKR(summary.totalWithdrawalsAmount)}
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800/80 text-xs">
            <span className="text-slate-400">{summary.totalWithdrawalsCount} Disbursed</span>
            <button
              onClick={() => onNavigateTab('withdrawals')}
              className="text-emerald-400 hover:text-emerald-300 font-semibold inline-flex items-center gap-1 cursor-pointer"
            >
              <span>View</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Pending Withdrawals */}
        <div className="bg-slate-900/90 border border-rose-500/30 hover:border-rose-500/50 rounded-2xl p-5 transition-all shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400/90">Pending Withdrawals</span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/30">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-400 font-display">
            {summary.pendingWithdrawalsCount} <span className="text-xs font-semibold text-slate-400">In Queue</span>
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800/80 text-xs">
            <span className="text-slate-400">{formatPKR(summary.pendingWithdrawalsAmount)} requested</span>
            <button
              onClick={() => onNavigateTab('withdrawals')}
              className="text-rose-400 hover:text-rose-300 font-bold inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Process Payouts</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          onClick={() => onNavigateTab('deposits')}
          className="p-5 rounded-2xl bg-gradient-to-r from-blue-950/40 via-slate-900 to-slate-900 border border-blue-800/40 hover:border-blue-500/60 transition-all cursor-pointer group shadow-sm flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30 group-hover:scale-105 transition-transform">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">
                Payment Verification Queue
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Inspect receipts, verify bank transactions, and approve member activations ({summary.pendingDepositsCount} pending)
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all shrink-0" />
        </div>

        <div
          onClick={() => onNavigateTab('withdrawals')}
          className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-800/40 hover:border-emerald-500/60 transition-all cursor-pointer group shadow-sm flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 group-hover:scale-105 transition-transform">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                Withdrawal Disbursals Queue
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Review JazzCash, EasyPaisa, and bank account details to confirm payouts ({summary.pendingWithdrawalsCount} pending)
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all shrink-0" />
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white font-display">Recent Activity</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Chronological log of deposits uploaded, approvals, rejections, and withdrawal requests.
            </p>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {activities.length} total events
          </span>
        </div>

        {activities.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            No recent activity
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map(act => (
              <div
                key={act.id}
                className="p-3.5 sm:p-4 rounded-2xl bg-slate-950/70 border border-slate-800/90 hover:border-slate-700/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 shrink-0 mt-0.5">
                    {getActivityIcon(act.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-bold text-slate-200">{act.title}</span>
                      {getActivityBadge(act.type)}
                    </div>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      {act.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/60">
                  {act.amount && (
                    <span className="font-mono font-bold text-slate-300">
                      {act.amount.toLocaleString()} PKR
                    </span>
                  )}
                  <span className="text-[11px] text-slate-500 font-mono">
                    {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
