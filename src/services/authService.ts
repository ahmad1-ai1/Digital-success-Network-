import { supabase } from '../lib/supabase';
import {
  profileFromDb,
  userFromProfile
} from '../lib/supabaseAdapters';
import { devStore } from '../store/devStore';
import { User, Profile } from '../types';
import { memberService } from './memberService';

export interface RegisterParams {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword?: string;
  referralCode?: string;
}

export const authService = {
  getCurrentUser(): User | null {
    const db = devStore.getData();

    if (!db.currentUserId) return null;

    return db.users.find(u => u.id === db.currentUserId) || null;
  },

  getCurrentProfile(): Profile | null {
    const user = this.getCurrentUser();

    if (!user) return null;

    return devStore.getData().profiles[user.id] || null;
  },

  /**
   * Lightweight profile sync.
   *
   * IMPORTANT:
   * This function intentionally fetches ONLY the current user's
   * profile from Supabase.
   *
   * It does NOT preload payment proofs, KYC, withdrawals,
   * commissions, points, spins, notifications, settings,
   * or every profile in the database.
   *
   * Those records should be loaded by the relevant pages/services
   * when they are actually needed.
   */
  async syncProfileForUser(userId: string): Promise<Profile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.warn(
          'Could not fetch Supabase profile:',
          error.message
        );

        const localProfile = devStore.getData().profiles[userId];

        return localProfile
          ? memberService.getProfile(userId)
          : null;
      }

      if (!data) {
        const localProfile = devStore.getData().profiles[userId];

        return localProfile
          ? memberService.getProfile(userId)
          : null;
      }

      const profile = profileFromDb(data);
      const user = userFromProfile(profile);

      devStore.save(db => {
        db.currentUserId = user.id;

        const userIndex = db.users.findIndex(
          existingUser => existingUser.id === user.id
        );

        if (userIndex >= 0) {
          db.users[userIndex] = user;
        } else {
          db.users.push(user);
        }

        db.profiles[user.id] = profile;
      });

      return profile;
    } catch (err) {
      console.warn('Profile sync exception:', err);

      const localProfile = devStore.getData().profiles[userId];

      if (localProfile) {
        return memberService.getProfile(userId);
      }

      return null;
    }
  },

  async login(
    email: string,
    password?: string
  ): Promise<{
    success: boolean;
    user?: User;
    error?: string;
  }> {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      return {
        success: false,
        error: 'Please enter your email address.'
      };
    }

    if (!password) {
      return {
        success: false,
        error: 'Please enter your password.'
      };
    }

    try {
      /**
       * Authenticate with Supabase Auth.
       */
      const { data, error } =
        await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password
        });

      if (error) {
        /**
         * Local/demo fallback.
         */
        const localUser = devStore
          .getData()
          .users
          .find(
            u => u.email.toLowerCase() === cleanEmail
          );

        if (localUser) {
          devStore.save(db => {
            db.currentUserId = localUser.id;
          });

          return {
            success: true,
            user: localUser
          };
        }

        return {
          success: false,
          error: error.message
        };
      }

      if (!data.user) {
        return {
          success: false,
          error:
            'Login failed. User session could not be established.'
        };
      }

      /**
       * IMPORTANT:
       * Only fetch the current user's profile.
       * No bulk database loading here.
       */
      const profile = await this.syncProfileForUser(
        data.user.id
      );

      if (profile) {
        /**
         * Block suspended accounts.
         */
        if (profile.accountStatus === 'suspended') {
          await supabase.auth.signOut();

          devStore.save(db => {
            db.currentUserId = null;
          });

          return {
            success: false,
            error:
              'Your account has been suspended. Please contact DSN support.'
          };
        }

        const appUser = userFromProfile(profile);

        return {
          success: true,
          user: appUser
        };
      }

      /**
       * Fallback if profile cannot be read.
       */
      const isAdminEmail =
        cleanEmail === 'admin@digitalsuccessnetwork.pk';

      const existingProfile =
        devStore.getData().profiles[data.user.id];

      const existingUser =
        devStore
          .getData()
          .users
          .find(u => u.id === data.user.id);

      let isProofApproved = false;

      try {
        const { data: userProofs } = await supabase
          .from('payment_proofs')
          .select('status')
          .eq('user_id', data.user.id);

        isProofApproved =
          userProofs?.some(
            p =>
              p.status === 'approved' ||
              p.status === 'verified'
          ) || false;
      } catch {
        /**
         * Ignore proof lookup failure.
         */
      }

      const resolvedStatus = isProofApproved
        ? 'active'
        : (
            existingProfile?.accountStatus ||
            existingUser?.accountStatus ||
            'pending_activation'
          );

      const resolvedProofStatus = isProofApproved
        ? 'approved'
        : (
            existingProfile?.paymentProofStatus ||
            'pending'
          );

      const fallbackUser: User = {
        id: data.user.id,

        fullName:
          existingUser?.fullName ||
          data.user.user_metadata?.full_name ||
          cleanEmail.split('@')[0],

        email: cleanEmail,

        phone:
          existingUser?.phone ||
          data.user.user_metadata?.phone ||
          '',

        role: isAdminEmail
          ? 'admin'
          : (
              existingUser?.role ||
              (data.user.user_metadata?.role as any) ||
              'member'
            ),

        referralCode:
          existingUser?.referralCode ||
          data.user.user_metadata?.member_referral_code ||
          data.user.user_metadata?.referral_code ||
          `DSN-${Math.random()
            .toString(36)
            .substring(2, 8)
            .toUpperCase()}`,

        sponsorId:
          existingUser?.sponsorId ||
          data.user.user_metadata?.sponsor_id ||
          null,

        sponsorCode:
          existingUser?.sponsorCode ||
          data.user.user_metadata?.sponsor_code ||
          null,

        accountStatus: resolvedStatus,

        createdAt: data.user.created_at,

        updatedAt: new Date().toISOString()
      };

      const fallbackProfile: Profile = {
        ...fallbackUser,

        currentRank:
          existingProfile?.currentRank ||
          'Starter',

        currentPoints:
          existingProfile?.currentPoints ||
          0,

        availableBalance:
          existingProfile?.availableBalance ||
          0,

        totalEarnings:
          existingProfile?.totalEarnings ||
          0,

        pendingWithdrawals:
          existingProfile?.pendingWithdrawals ||
          0,

        spinCredits:
          existingProfile?.spinCredits ||
          0,

        directTeamCount:
          existingProfile?.directTeamCount ||
          0,

        totalTeamCount:
          existingProfile?.totalTeamCount ||
          0,

        kycStatus:
          existingProfile?.kycStatus ||
          'not_submitted',

        paymentProofStatus:
          resolvedProofStatus
      };

      devStore.save(db => {
        db.currentUserId = fallbackUser.id;

        const userIndex = db.users.findIndex(
          u => u.id === fallbackUser.id
        );

        if (userIndex >= 0) {
          db.users[userIndex] = fallbackUser;
        } else {
          db.users.push(fallbackUser);
        }

        if (!db.profiles[fallbackUser.id]) {
          db.profiles[fallbackUser.id] =
            fallbackProfile;
        }
      });

      return {
        success: true,
        user: fallbackUser
      };
    } catch (err: any) {
      /**
       * Final local fallback.
       */
      const localUser = devStore
        .getData()
        .users
        .find(
          u => u.email.toLowerCase() === cleanEmail
        );

      if (localUser) {
        devStore.save(db => {
          db.currentUserId = localUser.id;
        });

        return {
          success: true,
          user: localUser
        };
      }

      return {
        success: false,
        error:
          err?.message ||
          'An unexpected error occurred during login.'
      };
    }
  },

  async register(
    params: RegisterParams
  ): Promise<{
    success: boolean;
    user?: User;
    error?: string;
  }> {
    const {
      fullName,
      email,
      phone,
      password,
      referralCode
    } = params;

    const cleanEmail =
      email.trim().toLowerCase();

    const cleanName =
      fullName.trim();

    const cleanPhone =
      phone.trim();

    if (
      !cleanName ||
      !cleanEmail ||
      !cleanPhone ||
      !password
    ) {
      return {
        success: false,
        error: 'All fields are required.'
      };
    }

    if (password.length < 6) {
      return {
        success: false,
        error:
          'Password must be at least 6 characters long.'
      };
    }

    let sponsorId: string | null = null;
    let sponsorCode: string | null = null;

    /**
     * Check sponsor referral code.
     */
    if (
      referralCode &&
      referralCode.trim()
    ) {
      const code =
        referralCode
          .trim()
          .toUpperCase();

      try {
        const { data: sponsorRow } =
          await supabase
            .from('profiles')
            .select(
              'id, referral_code, full_name'
            )
            .ilike(
              'referral_code',
              code
            )
            .maybeSingle();

        if (sponsorRow) {
          sponsorId = sponsorRow.id;
          sponsorCode =
            sponsorRow.referral_code;
        } else {
          /**
           * Local sponsor fallback.
           */
          const localSponsor =
            devStore
              .getData()
              .users
              .find(
                u =>
                  u.referralCode.toUpperCase() ===
                  code
              );

          if (localSponsor) {
            sponsorId =
              localSponsor.id;

            sponsorCode =
              localSponsor.referralCode;
          } else if (
            /^DSN-[A-Z0-9_-]{2,15}$/i.test(
              code
            ) ||
            code.length >= 3
          ) {
            sponsorCode = code;
          } else {
            return {
              success: false,
              error: `Referral code "${referralCode}" not found. Please verify or leave blank for direct registration.`
            };
          }
        }
      } catch (err) {
        console.warn(
          'Error checking sponsor referral code:',
          err
        );

        if (
          /^DSN-[A-Z0-9_-]{2,15}$/i.test(
            code
          ) ||
          code.length >= 3
        ) {
          sponsorCode = code;
        }
      }
    }

    const newReferralCode =
      `DSN-${Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase()}`;

    try {
      /**
       * Sign up with Supabase Auth.
       *
       * The database trigger reads referral_code
       * from user metadata.
       */
      const { data, error } =
        await supabase.auth.signUp({
          email: cleanEmail,
          password,

          options: {
            data: {
              full_name: cleanName,
              phone: cleanPhone,
              role: 'member',

              referral_code:
                sponsorCode || undefined,

              sponsor_code:
                sponsorCode || undefined,

              sponsor_id:
                sponsorId || undefined,

              member_referral_code:
                newReferralCode
            }
          }
        });

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      if (!data.user) {
        return {
          success: false,
          error:
            'Registration succeeded but user could not be retrieved.'
        };
      }

      const newUserId =
        data.user.id;

      /**
       * Upsert profile.
       */
      const profilePayload = {
        id: newUserId,

        full_name: cleanName,

        email: cleanEmail,

        phone: cleanPhone,

        role: 'member',

        referral_code:
          newReferralCode,

        sponsor_id:
          sponsorId,

        sponsor_code:
          sponsorCode,

        account_status:
          'pending_activation',

        current_rank:
          'Starter',

        current_points:
          0,

        available_balance:
          0,

        total_earnings:
          0,

        pending_withdrawals:
          0,

        spin_credits:
          0,

        direct_team_count:
          0,

        total_team_count:
          0,

        kyc_status:
          'not_submitted',

        payment_proof_status:
          'pending',

        created_at:
          new Date().toISOString(),

        updated_at:
          new Date().toISOString()
      };

      await supabase
        .from('profiles')
        .upsert(profilePayload);

      /**
       * Record referral if sponsored.
       */
      if (sponsorId) {
        await supabase
          .from('referrals')
          .insert({
            referrer_id:
              sponsorId,

            referred_user_id:
              newUserId,

            level: 1,

            status:
              'pending_activation'
          });
      }

      /**
       * Create local user cache.
       */
      const newUser: User = {
        id: newUserId,

        fullName: cleanName,

        email: cleanEmail,

        phone: cleanPhone,

        role: 'member',

        referralCode:
          newReferralCode,

        sponsorId,

        sponsorCode,

        accountStatus:
          'pending_activation',

        createdAt:
          new Date().toISOString(),

        updatedAt:
          new Date().toISOString()
      };

      const newProfile: Profile = {
        ...newUser,

        currentRank:
          'Starter',

        currentPoints:
          0,

        availableBalance:
          0,

        totalEarnings:
          0,

        pendingWithdrawals:
          0,

        spinCredits:
          0,

        directTeamCount:
          0,

        totalTeamCount:
          0,

        kycStatus:
          'not_submitted',

        paymentProofStatus:
          'pending'
      };

      devStore.save(db => {
        db.currentUserId =
          newUserId;

        db.users.push(
          newUser
        );

        db.profiles[
          newUserId
        ] = newProfile;
      });

      return {
        success: true,
        user: newUser
      };
    } catch (err: any) {
      return {
        success: false,
        error:
          err?.message ||
          'An error occurred during registration.'
      };
    }
  },

  async logout(): Promise<void> {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn(
        'Sign out error:',
        err
      );
    }

    devStore.save(data => {
      data.currentUserId = null;
    });
  },

  async resetPassword(
    email: string
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    const cleanEmail =
      email.trim().toLowerCase();

    try {
      const { error } =
        await supabase.auth.resetPasswordForEmail(
          cleanEmail
        );

      if (error) {
        return {
          success: false,
          message: error.message
        };
      }

      return {
        success: true,
        message: `Password reset instructions have been sent to ${cleanEmail}.`
      };
    } catch (err: any) {
      return {
        success: false,
        message:
          err?.message ||
          'Unable to request password reset at this time.'
      };
    }
  }
};
