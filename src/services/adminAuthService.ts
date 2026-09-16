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
      let adminFullName = data.user.user_metadata?.full_name || 'Central Administrator';

      // Check user metadata and app metadata case-insensitively
      const metaRole = (
        data.user.user_metadata?.role ||
        data.user.app_metadata?.role ||
        (data.user as any).role ||
        ''
      ).toString().trim().toLowerCase();
      let isAdmin = metaRole === 'admin';

      // Check database via PostgreSQL RPC is_admin() (SECURITY DEFINER, queries profiles.role for auth.uid())
      if (!isAdmin) {
        try {
          const { data: rpcIsAdmin, error: rpcErr } = await supabase.rpc('is_admin');
          if (!rpcErr && rpcIsAdmin === true) {
            isAdmin = true;
          }
        } catch {
          // If RPC invocation encounters an error, proceed to direct profile query
        }
      }

      // Check profiles table directly by authenticated user ID
      if (!isAdmin || adminFullName === 'Central Administrator') {
        try {
          const { data: profile, error: profileErr } = await supabase
            .from('profiles')
            .select('full_name, role')
            .eq('id', data.user.id)
            .maybeSingle();

          if (!profileErr && profile) {
            if (profile.full_name) {
              adminFullName = profile.full_name;
            }
            const roleStr = (profile.role || '').toString().trim().toLowerCase();
            if (roleStr === 'admin') {
              isAdmin = true;
            }
          }
        } catch {
          // If direct profiles table query fails
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
        fullName: adminFullName,
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
