import React from 'react';
import { LanguageProvider } from './i18n/LanguageContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NavigationProvider, useNavigation } from './context/NavigationContext';

// Layouts
import { MainLayout } from './components/layout/MainLayout';
import { MemberLayout } from './components/member/MemberLayout';
import { AdminLayout } from './components/admin/AdminLayout';

// Public & Auth Pages
import { HomePage } from './components/public/HomePage';
import { AboutPage } from './components/public/AboutPage';
import { HowItWorksPage } from './components/public/HowItWorksPage';
import { ProductsPage } from './components/public/ProductsPage';
import { LegalPage } from './components/public/LegalPage';
import { SupportPage } from './components/public/SupportPage';
import { LoginPage } from './components/auth/LoginPage';
import { RegisterPage } from './components/auth/RegisterPage';
import { ForgotPasswordPage } from './components/auth/ForgotPasswordPage';

// Member Views
import { DashboardOverview } from './components/member/DashboardOverview';
import { ReferralView } from './components/member/ReferralView';
import { TeamView } from './components/member/TeamView';
import { CommissionsView } from './components/member/CommissionsView';
import { PointsView } from './components/member/PointsView';
import { RankView } from './components/member/RankView';
import { SpinView } from './components/member/SpinView';
import { LeaderboardView } from './components/member/LeaderboardView';
import { AchievementsView } from './components/member/AchievementsView';
import { WithdrawalsView } from './components/member/WithdrawalsView';
import { NotificationsView } from './components/member/NotificationsView';
import { ProfileView } from './components/member/ProfileView';
import { KYCView } from './components/member/KYCView';
import { PaymentProofView } from './components/member/PaymentProofView';

// Admin Views
import { AdminPortalView } from './components/admin/AdminPortalView';

const AppRouter: React.FC = () => {
  const { currentPath } = useNavigation();
  const { user, isAdmin } = useAuth();

  // 1. Admin Routes (Admin Portal with Supabase Auth structure)
  if (currentPath.startsWith('/admin')) {
    return <AdminPortalView />;
  }

  // 2. Member Dashboard Routes
  if (currentPath.startsWith('/dashboard')) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <MemberLayout>
          {currentPath === '/dashboard' && <DashboardOverview />}
          {currentPath === '/dashboard/referral' && <ReferralView />}
          {currentPath === '/dashboard/team' && <TeamView />}
          {currentPath === '/dashboard/commissions' && <CommissionsView />}
          {currentPath === '/dashboard/points' && <PointsView />}
          {currentPath === '/dashboard/rank' && <RankView />}
          {currentPath === '/dashboard/spin' && <SpinView />}
          {currentPath === '/dashboard/leaderboard' && <LeaderboardView />}
          {currentPath === '/dashboard/achievements' && <AchievementsView />}
          {currentPath === '/dashboard/withdrawals' && <WithdrawalsView />}
          {currentPath === '/dashboard/notifications' && <NotificationsView />}
          {currentPath === '/dashboard/profile' && <ProfileView />}
          {currentPath === '/dashboard/kyc' && <KYCView />}
          {currentPath === '/dashboard/payment-proof' && <PaymentProofView />}
        </MemberLayout>
      </div>
    );
  }

  // 3. Public and Authentication Routes
  return (
    <MainLayout>
      {(currentPath === '/' || currentPath === '') && <HomePage />}
      {currentPath === '/about' && <AboutPage />}
      {currentPath === '/how-it-works' && <HowItWorksPage />}
      {currentPath === '/products' && <ProductsPage />}
      {currentPath === '/legal' && <LegalPage />}
      {currentPath === '/support' && <SupportPage />}
      {currentPath === '/login' && <LoginPage />}
      {currentPath === '/register' && <RegisterPage />}
      {currentPath === '/forgot-password' && <ForgotPasswordPage />}
    </MainLayout>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <ToastProvider>
        <AuthProvider>
          <NavigationProvider>
            <AppRouter />
          </NavigationProvider>
        </AuthProvider>
      </ToastProvider>
    </LanguageProvider>
  );
}
