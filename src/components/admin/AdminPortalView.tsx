import React, { useState, useEffect } from 'react';
import { useNavigation } from '../../context/NavigationContext';
import { adminAuthService } from '../../services/adminAuthService';
import { AdminLoginPage } from './AdminLoginPage';
import { AdminPortalLayout } from './AdminPortalLayout';
import { AdminDashboardOverview } from './AdminDashboardOverview';
import { AdminDepositsView } from './AdminDepositsView';
import { AdminWithdrawalsManagementView } from './AdminWithdrawalsManagementView';

export const AdminPortalView: React.FC = () => {
  const { currentPath, navigate } = useNavigation();
  const [isAuth, setIsAuth] = useState(() => adminAuthService.isAuthenticated());

  // Re-check authentication whenever route or storage changes
  useEffect(() => {
    setIsAuth(adminAuthService.isAuthenticated());

    const handleStorageChange = () => {
      setIsAuth(adminAuthService.isAuthenticated());
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [currentPath]);

  // Sync tab with path
  const getTabFromPath = (): 'dashboard' | 'deposits' | 'withdrawals' => {
    if (currentPath.includes('/deposits') || currentPath.includes('/payments')) {
      return 'deposits';
    }
    if (currentPath.includes('/withdrawals')) {
      return 'withdrawals';
    }
    return 'dashboard';
  };

  const [currentTab, setCurrentTab] = useState<'dashboard' | 'deposits' | 'withdrawals'>(getTabFromPath);

  useEffect(() => {
    setCurrentTab(getTabFromPath());
  }, [currentPath]);

  // If not authenticated, always show Admin Login Page
  if (!isAuth) {
    return <AdminLoginPage />;
  }

  const handleTabChange = (tab: 'dashboard' | 'deposits' | 'withdrawals') => {
    setCurrentTab(tab);
    if (tab === 'dashboard') {
      navigate('/admin/dashboard');
    } else if (tab === 'deposits') {
      navigate('/admin/deposits');
    } else if (tab === 'withdrawals') {
      navigate('/admin/withdrawals');
    }
  };

  return (
    <AdminPortalLayout currentTab={currentTab} onTabChange={handleTabChange}>
      {currentTab === 'dashboard' && (
        <AdminDashboardOverview onNavigateTab={handleTabChange} />
      )}
      {currentTab === 'deposits' && <AdminDepositsView />}
      {currentTab === 'withdrawals' && <AdminWithdrawalsManagementView />}
    </AdminPortalLayout>
  );
};
