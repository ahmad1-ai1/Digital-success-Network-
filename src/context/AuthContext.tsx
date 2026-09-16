import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Profile } from '../types';
import { authService, memberService, RegisterParams } from '../services';
import { devStore } from '../store/devStore';
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
        if (sessionData?.session?.user?.id) {
          currentUserId = sessionData.session.user.id;
        }
      } catch (err) {
        console.warn('Could not read session in refreshUser:', err);
      }
    }

    if (currentUserId) {
      try {
        const liveProfile = await authService.syncProfileForUser(currentUserId);
        if (liveProfile) {
          setProfile(liveProfile);
          const liveUser = userFromProfile(liveProfile);
          setUser(liveUser);
          return;
        }
      } catch (err) {
        console.warn('Could not refresh profile from Supabase:', err);
      }

      if (cur) {
        setUser(cur);
        setProfile(memberService.getProfile(cur.id));
      }
    } else {
      setUser(null);
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    refreshUser();

    // Listen to Supabase Auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await authService.syncProfileForUser(session.user.id);
        refreshUser();
      } else {
        refreshUser();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [refreshUser]);

  // Realtime subscription, focus/visibility refetch, and polling for member status
  useEffect(() => {
    if (!user?.id) return;
    const currentUserId = user.id;

    // Supabase Realtime channel for instant push on admin approve/reject
    const channel = supabase
      .channel(`rt-user-status-${currentUserId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${currentUserId}`
        },
        async () => {
          await authService.syncProfileForUser(currentUserId);
          refreshUser();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payment_proofs',
          filter: `user_id=eq.${currentUserId}`
        },
        async () => {
          await authService.syncProfileForUser(currentUserId);
          refreshUser();
        }
      )
      .subscribe();

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

    // Reliable fallback polling interval (6s)
    const pollTimer = setInterval(() => {
      refreshUser();
    }, 6000);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      clearInterval(pollTimer);
    };
  }, [user?.id, refreshUser]);

  const login = async (email: string, password?: string) => {
    const res = await authService.login(email, password);
    if (res.success) {
      refreshUser();
    }
    return res;
  };

  const register = async (params: RegisterParams) => {
    const res = await authService.register(params);
    if (res.success) {
      refreshUser();
    }
    return res;
  };

  const logout = async () => {
    await authService.logout();
    refreshUser();
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
