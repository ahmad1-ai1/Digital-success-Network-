import React, { useState, useEffect, useRef } from 'react';
import { useNavigation } from '../../context/NavigationContext';
import { adminAuthService } from '../../services/adminAuthService';
import { adminPortalService, AdminNotification } from '../../services/adminPortalService';
import { useToast } from '../../context/ToastContext';
import {
  LayoutDashboard,
  Receipt,
  Wallet,
  LogOut,
  Bell,
  CheckCircle2,
  XCircle,
  Clock,
  Shield,
  Menu,
  X,
  ExternalLink,
  ChevronDown,
  UserCheck
} from 'lucide-react';

interface AdminPortalLayoutProps {
  currentTab: 'dashboard' | 'deposits' | 'withdrawals';
  onTabChange: (tab: 'dashboard' | 'deposits' | 'withdrawals') => void;
  children: React.ReactNode;
}

export const AdminPortalLayout: React.FC<AdminPortalLayoutProps> = ({
  currentTab,
  onTabChange,
  children
}) => {
  const { navigate } = useNavigation();
  const { info, success } = useToast();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<AdminNotification[]>(() => adminPortalService.getNotifications());
  const [unreadCount, setUnreadCount] = useState<number>(() => adminPortalService.getUnreadNotificationsCount());

  const notifRef = useRef<HTMLDivElement>(null);
  const adminUser = adminAuthService.getCurrentAdmin();

  // Refresh notifications periodically or on tab change
  useEffect(() => {
    setNotifications(adminPortalService.getNotifications());
    setUnreadCount(adminPortalService.getUnreadNotificationsCount());
  }, [currentTab]);

  // Click outside to close notification dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await adminAuthService.logout();
    success('Logged out of Admin Portal.');
    navigate('/admin');
  };

  const handleMarkAllRead = () => {
    adminPortalService.markAllNotificationsRead();
    setNotifications(adminPortalService.getNotifications());
    setUnreadCount(0);
    info('All notifications marked as read.');
  };

  const handleNotificationClick = (n: AdminNotification) => {
    adminPortalService.markNotificationRead(n.id);
    setNotifications(adminPortalService.getNotifications());
    setUnreadCount(adminPortalService.getUnreadNotificationsCount());
    setNotifDropdownOpen(false);

    if (n.type === 'deposit') {
      onTabChange('deposits');
    } else if (n.type === 'withdrawal') {
      onTabChange('withdrawals');
    }
  };

  const summary = adminPortalService.getDashboardSummary();

  const navItems = [
    {
      id: 'dashboard' as const,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'deposits' as const,
      label: 'Deposits',
      icon: Receipt,
      badge: summary.pendingDepositsCount > 0 ? summary.pendingDepositsCount : null,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
    },
    {
      id: 'withdrawals' as const,
      label: 'Withdrawals',
      icon: Wallet,
      badge: summary.pendingWithdrawalsCount > 0 ? summary.pendingWithdrawalsCount : null,
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Left: Brand + Badge */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onTabChange('dashboard')}
              className="flex items-center gap-2.5 group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-500 flex items-center justify-center text-white font-black text-sm shadow-md shadow-blue-900/40">
                DSN
              </div>
              <div>
                <span className="font-display font-extrabold text-sm sm:text-base text-white tracking-tight group-hover:text-blue-400 transition-colors">
                  ADMIN PORTAL
                </span>
                <span className="block text-[10px] text-emerald-400 font-semibold tracking-wide">
                  Operations Console
                </span>
              </div>
            </button>
          </div>

          {/* Center / Desktop Navigation Bar: ONLY Dashboard, Deposits, Withdrawals, Logout */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-950/80 p-1 rounded-2xl border border-slate-800">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`px-4 py-1.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                  {item.badge !== null && (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full border ${
                        isActive ? 'bg-white/20 text-white border-white/30' : item.badgeColor
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right: Notifications, Admin Info & Logout */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* View Public Site button */}
            <button
              onClick={() => navigate('/')}
              className="hidden lg:inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 transition-colors cursor-pointer"
              title="View Public DSN Site"
            >
              <span>Public Site</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </button>

            {/* Notifications Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className="relative p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 transition-colors cursor-pointer"
                title="Admin Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-mono text-[10px] font-bold flex items-center justify-center shadow-xs">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                  <div className="p-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-blue-400" />
                      <span className="text-xs font-bold text-white">Platform Notifications</span>
                      {unreadCount > 0 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono">
                          {unreadCount} unread
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[11px] text-blue-400 hover:text-blue-300 font-medium cursor-pointer"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-500">
                        No notifications
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          onClick={() => handleNotificationClick(n)}
                          className={`p-3.5 text-xs hover:bg-slate-950/60 transition-colors cursor-pointer flex gap-3 ${
                            !n.read ? 'bg-blue-950/20' : ''
                          }`}
                        >
                          <div className="mt-0.5 shrink-0">
                            {n.type === 'deposit' ? (
                              <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                                <Receipt className="w-3.5 h-3.5" />
                              </div>
                            ) : (
                              <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                                <Wallet className="w-3.5 h-3.5" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between gap-1 mb-0.5">
                              <span className={`font-bold ${!n.read ? 'text-white' : 'text-slate-300'}`}>
                                {n.title}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">
                                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-slate-400 text-[11px] leading-relaxed">
                              {n.message}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/50 text-slate-300 hover:text-rose-300 border border-slate-700/80 hover:border-rose-800/50 text-xs font-bold transition-all cursor-pointer"
              title="End Admin Session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>

            {/* Mobile menu hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 py-3 space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-between transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== null && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-950 text-white border border-slate-700">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
            <div className="pt-2 border-t border-slate-800">
              <button
                onClick={() => navigate('/')}
                className="w-full px-4 py-2 text-xs text-slate-400 hover:text-white flex items-center gap-2"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Return to Public Website</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Admin Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Digital Success Network • Central Operations Administration</span>
          <span className="text-slate-600 font-mono text-[11px]">Strict Role-Based Security • Supabase Prepared</span>
        </div>
      </footer>
    </div>
  );
};
