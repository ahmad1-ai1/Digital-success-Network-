import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Profile } from '../types';
import { authService, memberService, RegisterParams } from '../services';
import { supabase } from '../lib/supabase';
import { userFromProfile } from '../lib/supabaseAdapters';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; user?: User; error?: string }>;
  register: (params: RegisterParams) => Promise<{ success: boolean; user?: User; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void> | void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => authService.getCurrentUser());
  const [profile, setProfile] = useState<Profile | null>(() => {
    const cur = authService.getCurrentUser();
    return cur ? memberService.getProfile(cur.id) : null;
  });

  const refreshUser = useCallback(async () => {
    const cur = authService.getCurrentUser();
    let currentUserId = cur?.id;

    if (!currentUserId) {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        currentUserId = sessionData?.session?.user?.id;
      } catch (err) {
        console.warn('Could not read session in refreshUser:', err);
      }
    }

    if (!currentUserId) {
      setUser(null);
      setProfile(null);
      return;
    }

    try {
      const liveProfile = await authService.syncProfileForUser(currentUserId);

      if (liveProfile) {
        setProfile(liveProfile);
        setUser(userFromProfile(liveProfile));
        return;
      }
    } catch (err) {
      console.warn('Could not refresh profile from Supabase:', err);
    }

    if (cur) {
      setUser(cur);
      setProfile(memberService.getProfile(cur.id));
    }
  }, []);

  // Auth listener only.
  // IMPORTANT: do not call syncProfileForUser twice here.
  useEffect(() => {
    refreshUser();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        refreshUser();
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [refreshUser]);

  // Member status refresh.
  // Realtime is intentionally NOT used here because refreshUser()
  // already performs a Supabase profile sync. Using both together
  // can create repeated database requests.
  useEffect(() => {
    if (!user?.id) return;

    const onFocus = () => {
      refreshUser();
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshUser();
      }
    };

    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibilityChange);

    // Fallback: check member status every 6 seconds.
    const pollTimer = setInterval(() => {
      refreshUser();
    }, 6000);

    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      clearInterval(pollTimer);
    };
  }, [user?.id, refreshUser]);

  const login = async (email: string, password?: string) => {
    const res = await authService.login(email, password);

    if (res.success) {
      await refreshUser();
    }

    return res;
  };

  const register = async (params: RegisterParams) => {
    const res = await authService.register(params);

    if (res.success) {
      await refreshUser();
    }

    return res;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setProfile(null);
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAuthenticated,
        isAdmin,
        login,
        register,
        logout,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
};
