import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Profile } from '../types';
import { authService, memberService, RegisterParams } from '../services';
import { devStore } from '../store/devStore';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; user?: User; error?: string }>;
  register: (params: RegisterParams) => Promise<{ success: boolean; user?: User; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => authService.getCurrentUser());
  const [profile, setProfile] = useState<Profile | null>(() => {
    const cur = authService.getCurrentUser();
    return cur ? memberService.getProfile(cur.id) : null;
  });

  const refreshUser = useCallback(() => {
    const cur = authService.getCurrentUser();
    setUser(cur);
    if (cur) {
      setProfile(memberService.getProfile(cur.id));
    } else {
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
