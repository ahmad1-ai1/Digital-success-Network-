import React, { useState } from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import { useNavigation } from '../../context/NavigationContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { notificationService } from '../../services';
import {
  LayoutDashboard,
  Share2,
  Users,
  DollarSign,
  Zap,
  Award,
  Gift,
  Trophy,
  Medal,
  Wallet,
  Bell,
  User,
  ShieldCheck,
  Receipt,
  LogOut,
  Menu,
  X,
  Copy,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const MemberLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t, language } = useTranslation();
  const { currentPath, navigate } = useNavigation();
  const { user, profile, logout } = useAuth();
  const { success } = useToast();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  if (!user || !profile) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Member Login Required</h2>
        <p className="text-sm text-slate-600 mb-6">Please log in to view your member dashboard.</p>
        <button
          onClick={() => navigate('/login')}
          className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl text-sm"
        >
          Go to Login
        </button>
      </div>
    );
  }

  const unreadNotifications = notificationService.getUnreadCount(user.id);

  const menuItems = [
    { label: t('dashOverview'), path: '/dashboard', icon: LayoutDashboard },
    { label: t('dashReferral'), path: '/dashboard/referral', icon: Share2 },
    { label: t('dashTeam'), path: '/dashboard/team', icon: Users },
    { label: t('dashCommissions'), path: '/dashboard/commissions', icon: DollarSign },
    { label: t('dashPoints'), path: '/dashboard/points', icon: Zap },
    { label: t('dashRank'), path: '/dashboard/rank', icon: Award },
    { label: t('dashSpin'), path: '/dashboard/spin', icon: Gift, badge: profile.spinCredits > 0 ? `${profile.spinCredits} free` : undefined },
    { label: t('dashLeaderboard'), path: '/dashboard/leaderboard', icon: Trophy },
    { label: t('dashAchievements'), path: '/dashboard/achievements', icon: Medal },
    { label: t('dashWithdrawals'), path: '/dashboard/withdrawals', icon: Wallet },
    { label: t('dashNotifications'), path: '/dashboard/notifications', icon: Bell, badge: unreadNotifications > 0 ? `${unreadNotifications}` : undefined },
    { label: t('dashPaymentProof'), path: '/dashboard/payment-proof', icon: Receipt, alert: profile.accountStatus !== 'active' },
    { label: t('dashKYC'), path: '/dashboard/kyc', icon: ShieldCheck, alert: profile.kycStatus === 'not_submitted' },
    { label: t('dashProfile'), path: '/dashboard/profile', icon: User }
  ];

  const handleCopyRef = () => {
    const fullLink = `${window.location.origin}/#/?ref=${user.referralCode}`;
    navigator.clipboard.writeText(fullLink);
    success(`Referral link copied to clipboard: ${user.referralCode}`);
  };

  const handleNav = (path: string) => {
    navigate(path);
    setMobileNavOpen(false);
  };

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return currentPath === '/dashboard';
    }
    return currentPath.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Pending Account Notice Banner */}
      {profile.accountStatus !== 'active' && (
        <div className="bg-amber-600 text-white px-4 py-3 text-xs sm:text-sm font-semibold shadow-xs">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-center sm:text-left">
              <AlertTriangle className="w-5 h-5 shrink-0 text-amber-200" />
              <span>
                <strong>Account Pending Activation:</strong> Aapka account faal (active) honay ka muntazir hai. Commissions aur team points unlock karne ke liye foran activation proof jama karwayein.
              </span>
            </div>
            <button
              onClick={() => handleNav('/dashboard/payment-proof')}
              className="shrink-0 px-3.5 py-1 rounded-lg bg-white text-amber-950 font-bold text-xs hover:bg-amber-50 transition-colors shadow-xs"
            >
              Submit Activation Proof →
            </button>
          </div>
        </div>
      )}

      {/* Member Header Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Toggle member menu"
            >
              {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 text-base sm:text-lg">
                  {user.fullName}
                </span>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-md uppercase ${
                    profile.accountStatus === 'active'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {profile.accountStatus.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">
                Sponsor:{' '}
                <strong className="text-slate-700">
                  {user.sponsorCode || 'Direct/Root Network'}
                </strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Referral Pill */}
            <button
              onClick={handleCopyRef}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold hover:bg-blue-100 transition-colors"
              title="Click to copy your referral link"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="font-mono">{user.referralCode}</span>
              <Copy className="w-3 h-3 text-blue-500" />
            </button>

            {/* Points & Rank Quick Pill */}
            <div className="hidden md:flex items-center gap-2 pl-3 border-l border-slate-200 text-xs">
              <div className="text-right">
                <span className="text-[11px] text-slate-500 font-semibold block">Points</span>
                <span className="font-bold text-blue-700">{profile.currentPoints} Pts</span>
              </div>
              <div className="text-right pl-2">
                <span className="text-[11px] text-slate-500 font-semibold block">Rank</span>
                <span className="font-bold text-amber-600">{profile.currentRank}</span>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="p-2 text-slate-500 hover:text-rose-600 rounded-xl hover:bg-slate-100 transition-colors"
              title="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Desktop Left Sidebar */}
          <aside className="hidden lg:block lg:col-span-3 space-y-1">
            <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs space-y-1 sticky top-20">
              <div className="px-3 py-2 mb-1 border-b border-slate-100 flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                <span>Navigation</span>
                <span className="text-[10px] text-blue-600 lowercase">{profile.currentRank} Tier</span>
              </div>

              {menuItems.map(item => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNav(item.path)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      active
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {item.alert && !active && (
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                      )}
                      {item.badge && (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold uppercase ${
                            active
                              ? 'bg-white/20 text-white'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Mobile Navigation Drawer */}
          {mobileNavOpen && (
            <div className="lg:hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex">
              <div className="w-4/5 max-w-xs bg-white h-full p-4 overflow-y-auto space-y-2 shadow-2xl">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <span className="font-bold text-sm text-slate-900">Member Menu</span>
                  <button
                    onClick={() => setMobileNavOpen(false)}
                    className="p-1 rounded-lg text-slate-500 hover:bg-slate-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-1 pt-2">
                  {menuItems.map(item => {
                    const Icon = item.icon;
                    const active = isActive(item.path);
                    return (
                      <button
                        key={item.path}
                        onClick={() => handleNav(item.path)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                          active
                            ? 'bg-blue-600 text-white'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
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

          {/* Main Subview Content */}
          <main className="lg:col-span-9">{children}</main>
        </div>
      </div>
    </div>
  );
};
