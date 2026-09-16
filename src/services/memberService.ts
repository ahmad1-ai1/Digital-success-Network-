import { supabase } from '../lib/supabase';
import { profileFromDb, userFromProfile } from '../lib/supabaseAdapters';
import { devStore } from '../store/devStore';
import { Profile, DashboardSummary } from '../types';
import { rankService } from './rankService';
import { commissionService } from './commissionService';
import { pointsService } from './pointsService';
import { notificationService } from './notificationService';
import { withdrawalService } from './withdrawalService';
import { referralService } from './referralService';

export const memberService = {
  getProfile(userId: string): Profile | null {
    const db = devStore.getData();
    const profile = db.profiles[userId];
    if (!profile) return null;

    // Recalculate dynamic values to ensure consistent state
    const currentRank = rankService.calculateRank(profile.currentPoints);
    const team = referralService.getTeam(userId);

    return {
      ...profile,
      currentRank,
      directTeamCount: team.counts.l1,
      totalTeamCount: team.counts.total
    };
  },

  async fetchProfile(userId: string): Promise<Profile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.warn('Error fetching profile from Supabase:', error.message);
        return this.getProfile(userId);
      }

      if (data) {
        const profile = profileFromDb(data);
        const user = userFromProfile(profile);

        devStore.save(db => {
          const idx = db.users.findIndex(u => u.id === user.id);
          if (idx >= 0) db.users[idx] = user;
          else db.users.push(user);
          db.profiles[user.id] = profile;
        });

        return this.getProfile(userId);
      }
    } catch (err) {
      console.warn('fetchProfile exception:', err);
    }
    return this.getProfile(userId);
  },

  async updateProfile(
    userId: string,
    updates: {
      fullName?: string;
      phone?: string;
      notificationPreferences?: Profile['notificationPreferences'];
      languagePreference?: Profile['languagePreference'];
    }
  ): Promise<{ success: boolean; profile?: Profile; error?: string }> {
    let updatedProfile: Profile | undefined;

    // Update in Supabase
    try {
      const dbUpdates: any = { updated_at: new Date().toISOString() };
      if (updates.fullName?.trim()) dbUpdates.full_name = updates.fullName.trim();
      if (updates.phone?.trim()) dbUpdates.phone = updates.phone.trim();
      if (updates.notificationPreferences) dbUpdates.notification_preferences = updates.notificationPreferences;
      if (updates.languagePreference) dbUpdates.language_preference = updates.languagePreference;

      await supabase
        .from('profiles')
        .update(dbUpdates)
        .eq('id', userId);
    } catch (err) {
      console.warn('Could not persist profile update to Supabase:', err);
    }

    // Update locally in devStore
    devStore.save(data => {
      const user = data.users.find(u => u.id === userId);
      const profile = data.profiles[userId];

      if (user && profile) {
        if (updates.fullName && updates.fullName.trim()) {
          user.fullName = updates.fullName.trim();
          profile.fullName = updates.fullName.trim();
        }
        if (updates.phone && updates.phone.trim()) {
          user.phone = updates.phone.trim();
          profile.phone = updates.phone.trim();
        }
        if (updates.notificationPreferences) {
          profile.notificationPreferences = updates.notificationPreferences;
        }
        if (updates.languagePreference) {
          profile.languagePreference = updates.languagePreference;
        }
        user.updatedAt = new Date().toISOString();
        updatedProfile = profile;
      }
    });

    if (updatedProfile) {
      return { success: true, profile: updatedProfile };
    }
    return { success: false, error: 'User profile not found.' };
  },

  getDashboardSummary(userId: string): DashboardSummary | null {
    const profile = this.getProfile(userId);
    if (!profile) return null;

    const team = referralService.getTeam(userId);
    const commissions = commissionService.getCommissions(userId).slice(0, 5);
    const points = pointsService.getLedger(userId).slice(0, 5);
    const notifications = notificationService.getNotifications(userId).slice(0, 5);
    const withdrawals = withdrawalService.getWithdrawals(userId).slice(0, 5);

    return {
      profile,
      recentCommissions: commissions,
      recentPoints: points,
      recentNotifications: notifications,
      recentWithdrawals: withdrawals,
      teamStats: {
        l1Count: team.counts.l1,
        l2Count: team.counts.l2,
        l3Count: team.counts.l3,
        l4Count: team.counts.l4,
        activeCount: team.counts.active,
        pendingCount: team.counts.pending
      }
    };
  }
};
