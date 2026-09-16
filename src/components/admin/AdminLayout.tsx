import React, { useState } from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import { useNavigation } from '../../context/NavigationContext';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../services';
import {
  LayoutDashboard,
  Receipt,
  Wallet,
  ShieldCheck,
  Users,
  Package,
  Settings,
  LogOut,
  Menu,
  X,
  ShieldAlert,
  ArrowLeft
} from 'lucide-react';

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentPath, navigate } = useNavigation();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center bg-slate-900">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-4 text-rose-400">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Access Restricted</h2>
        <p className="text-sm text-slate-400 max-w-md mb-6 leading-relaxed">
          Central Administration credentials are strictly required to access this portal. Only authorized administrators can view these records and actions.
        </p>
        <button
          onClick={() => navigate('/login')}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
        >
          Sign In as Admin
        </button>
      </div>
    );
  }

  const pendingPaymentsCount = adminService.getPendingPayments().length;
  const pendingWithdrawalsCount = adminService.getPendingWithdrawals().length;
  const pendingKYCCount = adminService.getPendingKYC().length;

  const adminMenu = [
    { label: 'Admin Overview', path: '/admin', icon: LayoutDashboard },
    {
      label: 'Payment Verifications',
      path: '/admin/payments',
      icon: Receipt,
      badge: pendingPaymentsCount > 0 ? `${pendingPaymentsCount} Pending` : undefined,
      alert: pendingPaymentsCount > 0
    },
    {
      label: 'Withdrawal Payouts',
      path: '/admin/withdrawals',
      icon: Wallet,
      badge: pendingWithdrawalsCount > 0 ? `${pendingWithdrawalsCount} Pending` : undefined,
      alert: pendingWithdrawalsCount > 0
    },
    {
      label: 'KYC Verifications',
      path: '/admin/kyc',
      icon: ShieldCheck,
      badge: pendingKYCCount > 0 ? `${pendingKYCCount}` : undefined
    },
    { label: 'Users Management', path: '/admin/users', icon: Users },
    { label: 'Digital Products', path: '/admin/products', icon: Package },
    { label: 'System Settings', path: '/admin/settings', icon: Settings }
  ];

  const handleNav = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  const isActive = (path: string) => {
    if (path === '/admin') return currentPath === '/admin';
    return currentPath.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Top Header */}
      <div className="bg-slate-950 border-b border-slate-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:bg-slate-800"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
              <span className="font-black text-sm tracking-wide text-white uppercase font-display">
                DSN Administration Hub
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Switch to Member View</span>
            </button>

            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="p-2 text-slate-400 hover:text-rose-400 rounded-xl hover:bg-slate-800 transition-colors"
              title="Logout Admin"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Sidebar */}
          <aside className="hidden lg:block lg:col-span-3 space-y-1">
            <div className="bg-slate-950/80 rounded-2xl border border-slate-800 p-3 space-y-1 sticky top-20">
              <div className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-800/80 mb-2">
                Operations Menu
              </div>

              {adminMenu.map(item => {
                const Icon = item.icon;
                const active = isActive(item.path);

                return (
                  <button
                    key={item.path}
                    onClick={() => handleNav(item.path)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      active
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                          item.alert
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Mobile Navigation Drawer */}
          {mobileOpen && (
            <div className="lg:hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex">
              <div className="w-4/5 max-w-xs bg-slate-950 h-full p-4 overflow-y-auto space-y-2 border-r border-slate-800">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="font-bold text-sm text-white">Admin Navigation</span>
                  <button onClick={() => setMobileOpen(false)} className="text-slate-400">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-1 pt-2">
                  {adminMenu.map(item => {
                    const Icon = item.icon;
                    const active = isActive(item.path);
                    return (
                      <button
                        key={item.path}
                        onClick={() => handleNav(item.path)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                          active ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Subview */}
          <main className="lg:col-span-9">{children}</main>
        </div>
      </div>
    </div>
  );
};
