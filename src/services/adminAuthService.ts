import { supabase } from '../lib/supabase';
import { User } from '../types';

const ADMIN_SESSION_KEY = 'dsn_admin_session_auth';

export interface AdminAuthResult {
  success: boolean;
  user?: Partial<User>;
  error?: string;
}

/**
 * Admin Authentication Service
 * 
 * Powered by Supabase Auth:
 * - Admin credentials authenticated strictly via Supabase Auth
 * - No fake authentication, no demo bypasses, and no hardcoded passwords
 */
export const adminAuthService = {
  /**
   * Authenticate admin via Supabase Auth
   */
  async login(email: string, password: string): Promise<AdminAuthResult> {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      return { success: false, error: 'Please enter your administrator email.' };
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return { success: false, error: 'Please enter a valid administrator email address.' };
    }

    if (!password) {
      return { success: false, error: 'Please enter your password.' };
    }

    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters.' };
    }

    try {
      // 1. Supabase Authentication
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password
      });

      if (error || !data?.user) {
        return {
          success: false,
          error: error?.message || 'Invalid administrator login credentials.'
        };
      }

      // 2. Verify admin privilege
      const userRole = data.user.user_metadata?.role || data.user.app_metadata?.role;
      let isAdmin = userRole === 'admin';

      // Check profiles table if role is not directly in metadata
      if (!isAdmin) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.user.id)
            .maybeSingle();

          if (profile?.role === 'admin') {
            isAdmin = true;
          }
        } catch {
          // If profiles table query fails or is not yet created
        }
      }

      if (!isAdmin) {
        // Sign out non-admin account immediately
        await supabase.auth.signOut();
        return {
          success: false,
          error: 'Access restricted: Your account does not possess Central Administrator privileges.'
        };
      }

      const adminUser: Partial<User> = {
        id: data.user.id,
        fullName: data.user.user_metadata?.full_name || 'Central Administrator',
        email: cleanEmail,
        role: 'admin',
        accountStatus: 'active'
      };

      if (typeof window !== 'undefined') {
        sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(adminUser));
      }

      return { success: true, user: adminUser };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Authentication failed. Please verify credentials.'
      };
    }
  },

  /**
   * Check if current session has active admin privileges
   */
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;

    const stored = sessionStorage.getItem(ADMIN_SESSION_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed?.role === 'admin') return true;
      } catch (e) {
        // parse error
      }
    }

    return false;
  },

  /**
   * Get current admin profile details
   */
  getCurrentAdmin(): Partial<User> | null {
    if (typeof window === 'undefined') return null;

    const stored = sessionStorage.getItem(ADMIN_SESSION_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {}
    }

    return null;
  },

  /**
   * Terminate admin session
   */
  async logout(): Promise<void> {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      // ignore
    }

    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
    }
  }
};
