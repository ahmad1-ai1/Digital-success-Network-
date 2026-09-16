import { supabase } from '../lib/supabase';
import { withdrawalFromDb } from '../lib/supabaseAdapters';
import { devStore } from '../store/devStore';
import { Withdrawal, PaymentMethod } from '../types';

export const withdrawalService = {
  getMinWithdrawal(): number {
    return devStore.getData().settings.withdrawalMinPKR;
  },

  getFeeRate(): number {
    return devStore.getData().settings.withdrawalFeeRate;
  },

  calculateBreakdown(grossAmount: number): {
    grossAmount: number;
    feePercentage: number;
    feeAmount: number;
    netAmount: number;
    isValid: boolean;
    error?: string;
  } {
    const settings = devStore.getData().settings;
    const minPKR = settings.withdrawalMinPKR;
    const feeRate = settings.withdrawalFeeRate; // 0.02 (2%)

    if (isNaN(grossAmount) || grossAmount <= 0) {
      return {
        grossAmount: 0,
        feePercentage: feeRate * 100,
        feeAmount: 0,
        netAmount: 0,
        isValid: false,
        error: `Minimum withdrawal amount is ${minPKR} PKR.`
      };
    }

    if (grossAmount < minPKR) {
      return {
        grossAmount,
        feePercentage: feeRate * 100,
        feeAmount: Math.round(grossAmount * feeRate),
        netAmount: Math.round(grossAmount * (1 - feeRate)),
        isValid: false,
        error: `Minimum withdrawal is ${minPKR} PKR.`
      };
    }

    const feeAmount = Math.round(grossAmount * feeRate);
    const netAmount = grossAmount - feeAmount;

    return {
      grossAmount,
      feePercentage: feeRate * 100,
      feeAmount,
      netAmount,
      isValid: true
    };
  },

  getWithdrawals(userId: string): Withdrawal[] {
    return devStore.getData().withdrawals.filter(w => w.userId === userId).sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  getWithdrawalHistory(userId: string): Withdrawal[] {
    return this.getWithdrawals(userId);
  },

  async fetchWithdrawals(userId: string): Promise<Withdrawal[]> {
    try {
      const { data, error } = await supabase
        .from('withdrawals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        const list = data.map(withdrawalFromDb);
        devStore.save(db => {
          const others = db.withdrawals.filter(w => w.userId !== userId);
          db.withdrawals = [...list, ...others];
        });
        return list;
      }
    } catch (err) {
      console.warn('Error fetching withdrawals from Supabase:', err);
    }
    return this.getWithdrawals(userId);
  },

  getAllWithdrawals(): Withdrawal[] {
    return [...devStore.getData().withdrawals].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  async requestWithdrawal(
    arg1:
      | string
      | {
          userId: string;
          amount?: number;
          grossAmount?: number;
          payoutMethod?: any;
          paymentMethod?: any;
          accountTitle: string;
          accountNumber: string;
          userNote?: string;
        },
    arg2?: number,
    arg3?: PaymentMethod,
    arg4?: string,
    arg5?: string
  ): Promise<{ success: boolean; withdrawal?: Withdrawal; error?: string }> {
    let userId = '';
    let grossAmount = 0;
    let paymentMethod: PaymentMethod = 'JazzCash';
    let accountTitle = '';
    let accountNumber = '';
    let userNote = '';

    if (typeof arg1 === 'object') {
      userId = arg1.userId;
      grossAmount = arg1.grossAmount ?? arg1.amount ?? 0;
      const m = arg1.paymentMethod ?? arg1.payoutMethod;
      if (m) {
        paymentMethod = typeof m === 'string' ? (m.toLowerCase() === 'easypaisa' ? 'EasyPaisa' : m.toLowerCase() === 'bank' ? 'Bank' : 'JazzCash') : m;
      }
      accountTitle = arg1.accountTitle;
      accountNumber = arg1.accountNumber;
      userNote = arg1.userNote || '';
    } else {
      userId = arg1;
      grossAmount = arg2 || 0;
      paymentMethod = arg3 || 'JazzCash';
      accountTitle = arg4 || '';
      accountNumber = arg5 || '';
    }

    const db = devStore.getData();
    const profile = db.profiles[userId];

    if (!profile) {
      return { success: false, error: 'User profile not found.' };
    }

    if (profile.accountStatus !== 'active') {
      return { success: false, error: 'Your account must be Active to request withdrawals.' };
    }

    const calculation = this.calculateBreakdown(grossAmount);
    if (!calculation.isValid) {
      return { success: false, error: calculation.error };
    }

    if (profile.availableBalance < grossAmount) {
      return {
        success: false,
        error: `Insufficient balance. Available: ${profile.availableBalance} PKR, Requested: ${grossAmount} PKR.`
      };
    }

    if (!accountTitle.trim() || !accountNumber.trim()) {
      return { success: false, error: 'Account title and account number are required.' };
    }

    let withdrawalId = `WD-${Date.now().toString().slice(-6)}`;

    // 1. Execute via Supabase RPC or direct insert
    try {
      const { data: rpcRes, error: rpcError } = await supabase.rpc('request_withdrawal', {
        p_user_id: userId,
        p_gross_amount: grossAmount,
        p_payment_method: paymentMethod,
        p_account_title: accountTitle.trim(),
        p_account_number: accountNumber.trim(),
        p_user_note: userNote || null
      });

      if (!rpcError && rpcRes && rpcRes.success) {
        withdrawalId = rpcRes.withdrawal_id || withdrawalId;
      } else if (rpcError) {
        // Fallback: direct insert
        const { data: insertData } = await supabase
          .from('withdrawals')
          .insert({
            user_id: userId,
            user_full_name: profile.fullName,
            gross_amount: grossAmount,
            fee_percentage: calculation.feePercentage,
            fee_amount: calculation.feeAmount,
            net_amount: calculation.netAmount,
            payment_method: paymentMethod,
            account_title: accountTitle.trim(),
            account_number: accountNumber.trim(),
            user_note: userNote || null,
            status: 'pending'
          })
          .select()
          .single();

        if (insertData) {
          withdrawalId = insertData.id;
          // Deduct from profile in Supabase
          await supabase
            .from('profiles')
            .update({
              available_balance: Math.max(0, profile.availableBalance - grossAmount),
              pending_withdrawals: profile.pendingWithdrawals + grossAmount
            })
            .eq('id', userId);
        }
      }
    } catch (err) {
      console.warn('Supabase withdrawal request error:', err);
    }

    const withdrawal: Withdrawal = {
      id: withdrawalId,
      userId,
      userFullName: profile.fullName,
      grossAmount,
      feePercentage: calculation.feePercentage,
      feeAmount: calculation.feeAmount,
      netAmount: calculation.netAmount,
      paymentMethod,
      payoutMethod: (paymentMethod.toLowerCase() as any),
      amount: grossAmount,
      accountTitle: accountTitle.trim(),
      accountNumber: accountNumber.trim(),
      status: 'pending',
      userNote: userNote || undefined,
      createdAt: new Date().toISOString()
    };

    devStore.save(data => {
      const p = data.profiles[userId];
      p.availableBalance -= grossAmount;
      p.pendingWithdrawals += grossAmount;
      data.withdrawals.unshift(withdrawal);

      data.notifications.push({
        id: `notif-${Date.now()}`,
        userId,
        title: 'Withdrawal Requested',
        message: `Your request for ${grossAmount} PKR (${withdrawal.netAmount} PKR Net) via ${paymentMethod} is pending review.`,
        type: 'withdrawal_status_changed',
        read: false,
        createdAt: new Date().toISOString()
      });
    });

    return { success: true, withdrawal };
  }
};
