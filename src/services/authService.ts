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

    if (error) {
      console.warn('Could not fetch Supabase profile:', error.message);

      const localProfile = devStore.getData().profiles[userId];
      return localProfile ? memberService.getProfile(userId) : null;
    }

    if (!data) {
      const localProfile = devStore.getData().profiles[userId];
      return localProfile ? memberService.getProfile(userId) : null;
    }

    const profile = profileFromDb(data);
    const user = userFromProfile(profile);

    devStore.save(db => {
      db.currentUserId = user.id;

      const userIndex = db.users.findIndex(u => u.id === user.id);

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
