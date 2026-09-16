import { supabase } from '../lib/supabase';
import {
  profileFromDb,
  userFromProfile,
  paymentProofFromDb,
  kycFromDb,
  withdrawalFromDb,
  commissionFromDb,
  pointsFromDb,
  spinFromDb,
  spinPrizeFromDb,
  notificationFromDb
} from '../lib/supabaseAdapters';
import { devStore } from '../store/devStore';
import { User, Profile } from '../types';

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

  async syncProfileForUser(userId: string): Promise<Profile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error || !data) {
        if (error) console.warn('Could not fetch Supabase profile:', error.message);
        
        // Fallback: check existing local profile from devStore and verify against Supabase payment_proofs
        const existingProfile = devStore.getData().profiles[userId];
        try {
          const { data: userProofs } = await supabase
            .from('payment_proofs')
            .select('*')
            .eq('user_id', userId)
            .order('date_submitted', { ascending: false });

          const hasApproved = userProofs?.some(p => p.status === 'approved' || p.status === 'verified');
          const hasRejected = userProofs?.some(p => p.status === 'rejected');

          if (existingProfile) {
            if (hasApproved) {
              existingProfile.accountStatus = 'active';
              existingProfile.paymentProofStatus = 'approved';
            } else if (hasRejected && existingProfile.accountStatus !== 'active') {
              existingProfile.paymentProofStatus = 'rejected';
            }
            devStore.save(db => {
              db.profiles[userId] = existingProfile;
              const u = db.users.find(usr => usr.id === userId);
              if (u && hasApproved) {
                u.accountStatus = 'active';
              }
              if (userProofs && userProofs.length > 0) {
                db.paymentProofs = userProofs.map(paymentProofFromDb);
              }
            });
            return existingProfile;
          }
        } catch (proofErr) {
          console.warn('Error fetching payment proofs in fallback:', proofErr);
          if (existingProfile) return existingProfile;
        }
        return null;
      }

      if (data) {
        const profile = profileFromDb(data);
        const user = userFromProfile(profile);
        const isAdmin = user.role === 'admin';

        // Fetch dependent data in parallel
        const [
          proofsRes,
          kycRes,
          withdrawalsRes,
          commissionsRes,
          pointsRes,
          spinsRes,
          prizesRes,
          notifsRes,
          settingsRes,
          allProfilesRes
        ] = await Promise.allSettled([
          isAdmin
            ? supabase.from('payment_proofs').select('*').order('date_submitted', { ascending: false })
            : supabase.from('payment_proofs').select('*').eq('user_id', userId).order('date_submitted', { ascending: false }),
          isAdmin
            ? supabase.from('kyc_records').select('*').order('submitted_at', { ascending: false })
            : supabase.from('kyc_records').select('*').eq('user_id', userId),
          isAdmin
            ? supabase.from('withdrawals').select('*').order('created_at', { ascending: false })
            : supabase.from('withdrawals').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
          isAdmin
            ? supabase.from('commissions').select('*').order('created_at', { ascending: false })
            : supabase.from('commissions').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
          isAdmin
            ? supabase.from('points_ledger').select('*').order('created_at', { ascending: false })
            : supabase.from('points_ledger').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
          isAdmin
            ? supabase.from('spins').select('*').order('created_at', { ascending: false })
            : supabase.from('spins').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
          supabase.from('spin_prizes').select('*'),
          supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
          supabase.from('business_settings').select('*').eq('id', 1).maybeSingle(),
          supabase.from('profiles').select('*')
        ]);

        devStore.save(db => {
          db.currentUserId = user.id;
          const uIdx = db.users.findIndex(u => u.id === user.id);
          if (uIdx >= 0) {
            db.users[uIdx] = user;
          } else {
            db.users.push(user);
          }
          db.profiles[user.id] = profile;

          if (allProfilesRes.status === 'fulfilled' && allProfilesRes.value.data) {
            for (const pRow of allProfilesRes.value.data) {
              const p = profileFromDb(pRow);
              const u = userFromProfile(p);
              db.profiles[p.id] = p;
              const idx = db.users.findIndex(item => item.id === u.id);
              if (idx >= 0) {
                db.users[idx] = u;
              } else {
                db.users.push(u);
              }
            }
          }

          if (proofsRes.status === 'fulfilled' && proofsRes.value.data) {
            const mappedProofs = proofsRes.value.data.map(paymentProofFromDb);
            db.paymentProofs = mappedProofs;
            const hasApproved = mappedProofs.some(p => p.userId === user.id && (p.status === 'approved' || (p.status as string) === 'verified'));
            if (hasApproved) {
              profile.accountStatus = 'active';
              profile.paymentProofStatus = 'approved';
              user.accountStatus = 'active';
            }
          }
          if (kycRes.status === 'fulfilled' && kycRes.value.data) {
            db.kycRecords = kycRes.value.data.map(kycFromDb);
          }
          if (withdrawalsRes.status === 'fulfilled' && withdrawalsRes.value.data) {
            db.withdrawals = withdrawalsRes.value.data.map(withdrawalFromDb);
          }
          if (commissionsRes.status === 'fulfilled' && commissionsRes.value.data) {
            db.commissions = commissionsRes.value.data.map(commissionFromDb);
          }
          if (pointsRes.status === 'fulfilled' && pointsRes.value.data) {
            db.pointsLedger = pointsRes.value.data.map(pointsFromDb);
          }
          if (spinsRes.status === 'fulfilled' && spinsRes.value.data) {
            db.spinHistory = spinsRes.value.data.map(spinFromDb);
          }
          if (prizesRes.status === 'fulfilled' && prizesRes.value.data && prizesRes.value.data.length > 0) {
            db.spinPrizes = prizesRes.value.data.map(spinPrizeFromDb);
          }
          if (notifsRes.status === 'fulfilled' && notifsRes.value.data) {
            db.notifications = notifsRes.value.data.map(notificationFromDb);
          }
          if (settingsRes.status === 'fulfilled' && settingsRes.value.data) {
            const s = settingsRes.value.data;
            db.settings.activationFeePKR = Number(s.registration_fee_pkr) || db.settings.activationFeePKR;
            db.settings.commissionRates = {
              level1: Number(s.commission_rate_l1) || 0.20,
              level2: Number(s.commission_rate_l2) || 0.10,
              level3: Number(s.commission_rate_l3) || 0.05,
              level4: Number(s.commission_rate_l4) || 0.03
            };
            db.settings.directJoiningPoints = Number(s.direct_joining_points) || 50;
            db.settings.indirectJoiningPoints = Number(s.indirect_joining_points) || 25;
            db.settings.withdrawalMinPKR = Number(s.withdrawal_min_pkr) || 20;
            db.settings.withdrawalFeeRate = Number(s.withdrawal_fee_rate) || 0.02;
            db.settings.activationFeePKR = Number(s.activation_fee_pkr) || 1300;
          }
        });

        return profile;
      }
    } catch (err) {
      console.warn('Profile sync exception:', err);
    }
    return null;
  },

  async login(
    email: string,
    password?: string
  ): Promise<{ success: boolean; user?: User; error?: string }> {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      return { success: false, error: 'Please enter your email address.' };
    }

    if (!password) {
      return { success: false, error: 'Please enter your password.' };
    }

    try {
      // 1. Authenticate with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password
      });

      if (error) {
        // Fallback: check if local mock/demo user exists in devStore with this email
        const localUser = devStore.getData().users.find(u => u.email.toLowerCase() === cleanEmail);
        if (localUser) {
          devStore.save(db => {
            db.currentUserId = localUser.id;
          });
          return { success: true, user: localUser };
        }
        return { success: false, error: error.message };
      }

      if (!data.user) {
        return { success: false, error: 'Login failed. User session could not be established.' };
      }

      // 2. Fetch profile from Supabase profiles table
      const profile = await this.syncProfileForUser(data.user.id);

      if (profile) {
        if (profile.accountStatus === 'suspended') {
          await supabase.auth.signOut();
          devStore.save(db => {
            db.currentUserId = null;
          });
          return {
            success: false,
            error: 'Your account has been suspended. Please contact DSN support.'
          };
        }

        const appUser = userFromProfile(profile);
        return { success: true, user: appUser };
      }

      // 3. Fallback: If profile row was not directly readable, reconcile with existing state and proofs
      const isAdminEmail = cleanEmail === 'admin@digitalsuccessnetwork.pk';
      const existingProfile = devStore.getData().profiles[data.user.id];
      const existingUser = devStore.getData().users.find(u => u.id === data.user.id);

      let isProofApproved = false;
      try {
        const { data: userProofs } = await supabase
          .from('payment_proofs')
          .select('status')
          .eq('user_id', data.user.id);
        isProofApproved = userProofs?.some(p => p.status === 'approved' || p.status === 'verified') || false;
      } catch {
        // ignore
      }

      const resolvedStatus = isProofApproved
        ? 'active'
        : (existingProfile?.accountStatus || existingUser?.accountStatus || 'pending_activation');
      const resolvedProofStatus = isProofApproved
        ? 'approved'
        : (existingProfile?.paymentProofStatus || 'pending');

      const fallbackUser: User = {
        id: data.user.id,
        fullName: existingUser?.fullName || data.user.user_metadata?.full_name || cleanEmail.split('@')[0],
        email: cleanEmail,
        phone: existingUser?.phone || data.user.user_metadata?.phone || '',
        role: isAdminEmail ? 'admin' : (existingUser?.role || (data.user.user_metadata?.role as any) || 'member'),
        referralCode:
          existingUser?.referralCode ||
          data.user.user_metadata?.member_referral_code ||
          data.user.user_metadata?.referral_code ||
          `DSN-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        sponsorId: existingUser?.sponsorId || data.user.user_metadata?.sponsor_id || null,
        sponsorCode: existingUser?.sponsorCode || data.user.user_metadata?.sponsor_code || null,
        accountStatus: resolvedStatus,
        createdAt: data.user.created_at,
        updatedAt: new Date().toISOString()
      };

      const fallbackProfile: Profile = {
        ...fallbackUser,
        currentRank: existingProfile?.currentRank || 'Starter',
        currentPoints: existingProfile?.currentPoints || 0,
        availableBalance: existingProfile?.availableBalance || 0,
        totalEarnings: existingProfile?.totalEarnings || 0,
        pendingWithdrawals: existingProfile?.pendingWithdrawals || 0,
        spinCredits: existingProfile?.spinCredits || 0,
        directTeamCount: existingProfile?.directTeamCount || 0,
        totalTeamCount: existingProfile?.totalTeamCount || 0,
        kycStatus: existingProfile?.kycStatus || 'not_submitted',
        paymentProofStatus: resolvedProofStatus
      };

      devStore.save(db => {
        db.currentUserId = fallbackUser.id;
        const uIdx = db.users.findIndex(u => u.id === fallbackUser.id);
        if (uIdx >= 0) {
          db.users[uIdx] = fallbackUser;
        } else {
          db.users.push(fallbackUser);
        }
        if (!db.profiles[fallbackUser.id]) {
          db.profiles[fallbackUser.id] = fallbackProfile;
        }
      });

      return { success: true, user: fallbackUser };
    } catch (err: any) {
      const localUser = devStore.getData().users.find(u => u.email.toLowerCase() === cleanEmail);
      if (localUser) {
        devStore.save(db => {
          db.currentUserId = localUser.id;
        });
        return { success: true, user: localUser };
      }
      return { success: false, error: err.message || 'An unexpected error occurred during login.' };
    }
  },

  async register(
    params: RegisterParams
  ): Promise<{ success: boolean; user?: User; error?: string }> {
    const { fullName, email, phone, password, referralCode } = params;
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = fullName.trim();
    const cleanPhone = phone.trim();

    if (!cleanName || !cleanEmail || !cleanPhone || !password) {
      return { success: false, error: 'All fields are required.' };
    }

    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    let sponsorId: string | null = null;
    let sponsorCode: string | null = null;

    // Check sponsor referral code if provided
    if (referralCode && referralCode.trim()) {
      const code = referralCode.trim().toUpperCase();

      try {
        const { data: sponsorRow } = await supabase
          .from('profiles')
          .select('id, referral_code, full_name')
          .ilike('referral_code', code)
          .maybeSingle();

        if (sponsorRow) {
          sponsorId = sponsorRow.id;
          sponsorCode = sponsorRow.referral_code;
        } else {
          // Check local store fallback
          const localSponsor = devStore.getData().users.find(u => u.referralCode.toUpperCase() === code);
          if (localSponsor) {
            sponsorId = localSponsor.id;
            sponsorCode = localSponsor.referralCode;
          } else if (/^DSN-[A-Z0-9_-]{2,15}$/i.test(code) || code.length >= 3) {
            // Valid referral code format: accept it so database trigger handle_new_user resolves it
            sponsorCode = code;
          } else {
            return {
              success: false,
              error: `Referral code "${referralCode}" not found. Please verify or leave blank for direct registration.`
            };
          }
        }
      } catch (err) {
        console.warn('Error checking sponsor referral code:', err);
        if (/^DSN-[A-Z0-9_-]{2,15}$/i.test(code) || code.length >= 3) {
          sponsorCode = code;
        }
      }
    }

    const newReferralCode = `DSN-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    try {
      // Sign up with Supabase Auth
      // Note: trigger handle_new_user reads new.raw_user_meta_data->>'referral_code' to find the sponsor!
      // Therefore, pass the sponsorCode in referral_code metadata so the trigger finds the sponsor.
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: cleanName,
            phone: cleanPhone,
            role: 'member',
            referral_code: sponsorCode || undefined,
            sponsor_code: sponsorCode || undefined,
            sponsor_id: sponsorId || undefined,
            member_referral_code: newReferralCode
          }
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data.user) {
        return { success: false, error: 'Registration succeeded but user could not be retrieved.' };
      }

      const newUserId = data.user.id;

      // Upsert profile into public.profiles
      const profilePayload = {
        id: newUserId,
        full_name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        role: 'member',
        referral_code: newReferralCode,
        sponsor_id: sponsorId,
        sponsor_code: sponsorCode,
        account_status: 'pending_activation',
        current_rank: 'Starter',
        current_points: 0,
        available_balance: 0,
        total_earnings: 0,
        pending_withdrawals: 0,
        spin_credits: 0,
        direct_team_count: 0,
        total_team_count: 0,
        kyc_status: 'not_submitted',
        payment_proof_status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await supabase.from('profiles').upsert(profilePayload);

      // Record referral link if sponsored
      if (sponsorId) {
        await supabase.from('referrals').insert({
          referrer_id: sponsorId,
          referred_user_id: newUserId,
          level: 1,
          status: 'pending_activation'
        });
      }

      // Sync into local devStore cache
      const newUser: User = {
        id: newUserId,
        fullName: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        role: 'member',
        referralCode: newReferralCode,
        sponsorId,
        sponsorCode,
        accountStatus: 'pending_activation',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const newProfile: Profile = {
        ...newUser,
        currentRank: 'Starter',
        currentPoints: 0,
        availableBalance: 0,
        totalEarnings: 0,
        pendingWithdrawals: 0,
        spinCredits: 0,
        directTeamCount: 0,
        totalTeamCount: 0,
        kycStatus: 'not_submitted',
        paymentProofStatus: 'pending'
      };

      devStore.save(db => {
        db.currentUserId = newUserId;
        db.users.push(newUser);
        db.profiles[newUserId] = newProfile;
      });

      return { success: true, user: newUser };
    } catch (err: any) {
      return { success: false, error: err.message || 'An error occurred during registration.' };
    }
  },

  async logout(): Promise<void> {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Sign out error:', err);
    }
    devStore.save(data => {
      data.currentUserId = null;
    });
  },

  async resetPassword(email: string): Promise<{ success: boolean; message: string }> {
    const cleanEmail = email.trim().toLowerCase();
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail);
      if (error) {
        return { success: false, message: error.message };
      }
      return {
        success: true,
        message: `Password reset instructions have been sent to ${cleanEmail}.`
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Unable to request password reset at this time.'
      };
    }
  }
};

// Listen to Supabase auth state changes automatically
supabase.auth.getSession().then(({ data: { session } }) => {
  if (session?.user) {
    authService.syncProfileForUser(session.user.id);
  }
});

supabase.auth.onAuthStateChange(async (event, session) => {
  if (session?.user) {
    await authService.syncProfileForUser(session.user.id);
  } else if (event === 'SIGNED_OUT') {
    devStore.save(data => {
      data.currentUserId = null;
    });
  }
});
