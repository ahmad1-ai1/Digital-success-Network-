import { supabase } from '../lib/supabase';
import { spinFromDb } from '../lib/supabaseAdapters';
import { devStore } from '../store/devStore';
import { SpinPrize, Spin } from '../types';

export const spinService = {
  getSpinCredits(userId: string): number {
    const profile = devStore.getData().profiles[userId];
    return profile ? profile.spinCredits : 0;
  },

  getActivePrizes(): SpinPrize[] {
    return devStore.getData().spinPrizes.filter(p => p.active);
  },

  getPrizes(): SpinPrize[] {
    return this.getActivePrizes();
  },

  getAllPrizes(): SpinPrize[] {
    return devStore.getData().spinPrizes;
  },

  getHistory(userId: string): Spin[] {
    return devStore.getData().spinHistory.filter(s => s.userId === userId).sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  getSpinHistory(userId: string): Spin[] {
    return this.getHistory(userId);
  },

  async fetchSpinHistory(userId: string): Promise<Spin[]> {
    try {
      const { data, error } = await supabase
        .from('spins')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        const list = data.map(spinFromDb);
        devStore.save(db => {
          const others = db.spinHistory.filter(s => s.userId !== userId);
          db.spinHistory = [...list, ...others];
        });
        return list;
      }
    } catch (err) {
      console.warn('Error fetching spins from Supabase:', err);
    }
    return this.getHistory(userId);
  },

  getAllHistory(): Spin[] {
    return [...devStore.getData().spinHistory].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  async performSpin(userId: string) {
    return this.spin(userId);
  },

  async spin(userId: string): Promise<{ success: boolean; prize?: SpinPrize; error?: string; remainingCredits?: number }> {
    const db = devStore.getData();
    const profile = db.profiles[userId];

    if (!profile) {
      return { success: false, error: 'User profile not found.' };
    }

    if (profile.spinCredits < 1) {
      return { success: false, error: 'No spin credits available. Refer an active member to earn spins.' };
    }

    const activePrizes = db.spinPrizes.filter(p => p.active);
    if (activePrizes.length === 0) {
      return { success: false, error: 'No active spin prizes configured.' };
    }

    // Try Supabase RPC first
    try {
      const { data: rpcRes, error: rpcError } = await supabase.rpc('perform_spin', {
        p_user_id: userId
      });

      if (!rpcError && rpcRes && rpcRes.success) {
        const matchedPrize = activePrizes.find(p => p.name === rpcRes.prize_name) || {
          id: `pz-${Date.now()}`,
          name: rpcRes.prize_name,
          label: rpcRes.prize_name,
          type: rpcRes.prize_type as any,
          value: rpcRes.prize_value,
          weight: 10,
          color: '#3B82F6',
          active: true
        };

        // Update local store
        let remaining = rpcRes.remaining_credits;
        devStore.save(data => {
          const p = data.profiles[userId];
          p.spinCredits = rpcRes.remaining_credits;
          if (rpcRes.prize_type === 'cash') {
            p.availableBalance += rpcRes.prize_value;
            p.totalEarnings += rpcRes.prize_value;
          } else if (rpcRes.prize_type === 'points') {
            p.currentPoints += rpcRes.prize_value;
          }
        });

        return {
          success: true,
          prize: matchedPrize,
          remainingCredits: remaining
        };
      }
    } catch (err) {
      console.warn('RPC perform_spin failed, using fallback:', err);
    }

    // Fallback: Weighted random selection
    const totalWeight = activePrizes.reduce((sum, p) => sum + p.weight, 0);
    const randomVal = Math.random() * totalWeight;
    let runningWeight = 0;
    let selectedPrize = activePrizes[0];

    for (const prize of activePrizes) {
      runningWeight += prize.weight;
      if (randomVal <= runningWeight) {
        selectedPrize = prize;
        break;
      }
    }

    // Execute spin atomically in devStore
    let remaining = 0;
    devStore.save(data => {
      const p = data.profiles[userId];
      p.spinCredits = Math.max(0, p.spinCredits - 1);
      remaining = p.spinCredits;

      const spinRecord: Spin = {
        id: `spin-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        userId,
        prizeId: selectedPrize.id,
        prizeName: selectedPrize.name,
        prizeType: selectedPrize.type,
        prizeValue: selectedPrize.value,
        createdAt: new Date().toISOString()
      };
      data.spinHistory.push(spinRecord);

      // Apply prize rewards
      if (selectedPrize.type === 'points' && selectedPrize.value > 0) {
        p.currentPoints += selectedPrize.value;
        data.pointsLedger.push({
          id: `pts-${Date.now()}`,
          userId,
          sourceUserId: null,
          sourceUserName: 'Spin Wheel',
          level: 0,
          activity: `Lucky Spin Reward: ${selectedPrize.name}`,
          points: selectedPrize.value,
          createdAt: new Date().toISOString()
        });
      } else if (selectedPrize.type === 'cash' && selectedPrize.value > 0) {
        p.availableBalance += selectedPrize.value;
        p.totalEarnings += selectedPrize.value;
      } else if (selectedPrize.type === 'spins' && selectedPrize.value > 0) {
        p.spinCredits += selectedPrize.value;
        remaining = p.spinCredits;
      }

      // Add notification
      data.notifications.push({
        id: `notif-${Date.now()}`,
        userId,
        title: 'Lucky Spin Result',
        message: `You spun the wheel and won: ${selectedPrize.name}!`,
        type: 'spin_available',
        read: false,
        createdAt: new Date().toISOString()
      });
    });

    return {
      success: true,
      prize: selectedPrize,
      remainingCredits: remaining
    };
  }
};
