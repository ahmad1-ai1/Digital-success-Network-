import { devStore } from '../store/devStore';
import { adminAuthService } from './adminAuthService';
import { supabase } from '../lib/supabase';

export interface DepositItem {
  id: string;
  userId: string;
  userName: string;
  email: string;
  amount: number;
  method: string;
  transactionId: string;
  proofImage?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewedByName?: string;
  rejectionReason?: string;
}

export interface WithdrawalItem {
  id: string;
  userId: string;
  userName: string;
  email: string;
  amount: number;
  method: string;
  accountDetails: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewedByName?: string;
  rejectionReason?: string;
}

export interface AdminActivity {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  adminId?: string;
  adminName?: string;
}

export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  createdAt: string;
  read: boolean;
}

export interface DashboardSummary {
  totalMembers: number;
  activeMembers: number;
  pendingDeposits: number;
  pendingWithdrawals: number;
  totalDeposits: number;
  totalWithdrawals: number;
  totalRevenue: number;
}

const STORAGE_KEY = 'dsn_admin_portal_v3';
const ACTIVITY_KEY = 'dsn_admin_activity_v3';
const NOTIFICATION_KEY = 'dsn_admin_notifications_v3';

class AdminPortalService {
  private deposits: DepositItem[] = [];
  private withdrawals: WithdrawalItem[] = [];
  private activities: AdminActivity[] = [];
  private notifications: AdminNotification[] = [];
  private loadPromise: Promise<void> | null = null;
  private realtimeChannel: ReturnType<typeof supabase.channel> | null = null;

  constructor() {
    this.initLocalState();
    this.loadFromSupabase();
    this.setupRealtime();
  }

  private initLocalState(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);

      if (stored) {
        const parsed = JSON.parse(stored);

        this.deposits = Array.isArray(parsed.deposits)
          ? parsed.deposits
          : [];

        this.withdrawals = Array.isArray(parsed.withdrawals)
          ? parsed.withdrawals
          : [];
      }

      const storedActivities = localStorage.getItem(ACTIVITY_KEY);

      if (storedActivities) {
        const parsedActivities = JSON.parse(storedActivities);

        this.activities = Array.isArray(parsedActivities)
          ? parsedActivities
          : [];
      }

      const storedNotifications =
        localStorage.getItem(NOTIFICATION_KEY);

      if (storedNotifications) {
        const parsedNotifications = JSON.parse(
          storedNotifications
        );

        this.notifications = Array.isArray(parsedNotifications)
          ? parsedNotifications
          : [];
      }
    } catch (error) {
      console.error(
        'Failed to initialize admin local state:',
        error
      );
    }
  }

  private persist(): void {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          deposits: this.deposits,
          withdrawals: this.withdrawals,
        })
      );

      localStorage.setItem(
        ACTIVITY_KEY,
        JSON.stringify(this.activities)
      );

      localStorage.setItem(
        NOTIFICATION_KEY,
        JSON.stringify(this.notifications)
      );
    } catch (error) {
      console.error(
        'Failed to persist admin portal state:',
        error
      );
    }
  }

  private async loadFromSupabase(): Promise<void> {
    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = this.performSupabaseLoad().finally(() => {
      this.loadPromise = null;
    });

    return this.loadPromise;
  }

  private async performSupabaseLoad(): Promise<void> {
    try {
      const [paymentResult, withdrawalResult] =
        await Promise.all([
          supabase
            .from('payment_proofs')
            .select('*')
            .order('created_at', { ascending: false }),

          supabase
            .from('withdrawals')
            .select('*')
            .order('created_at', { ascending: false }),
        ]);

      if (paymentResult.error) {
        console.error(
          'Failed to load payment proofs:',
          paymentResult.error
        );
      } else {
        this.deposits = (paymentResult.data || []).map(
          (item: any) => ({
            id: item.id,
            userId: item.user_id,
            userName:
              item.user_name ||
              item.full_name ||
              item.name ||
              'Unknown User',
            email: item.email || '',
            amount: Number(item.amount || 0),
            method:
              item.payment_method ||
              item.method ||
              'Unknown',
            transactionId:
              item.transaction_id ||
              item.transactionId ||
              '',
            proofImage:
              item.proof_image ||
              item.proof_url ||
              item.payment_proof ||
              undefined,
            status:
              item.status === 'approved'
                ? 'approved'
                : item.status === 'rejected'
                  ? 'rejected'
                  : 'pending',
            createdAt:
              item.created_at ||
              new Date().toISOString(),
            reviewedAt:
              item.reviewed_at || undefined,
            reviewedBy:
              item.reviewed_by || undefined,
            reviewedByName:
              item.reviewed_by_name || undefined,
            rejectionReason:
              item.rejection_reason || undefined,
          })
        );
      }

      if (withdrawalResult.error) {
        console.error(
          'Failed to load withdrawals:',
          withdrawalResult.error
        );
      } else {
        this.withdrawals = (withdrawalResult.data || []).map(
          (item: any) => ({
            id: item.id,
            userId: item.user_id,
            userName:
              item.user_name ||
              item.full_name ||
              item.name ||
              'Unknown User',
            email: item.email || '',
            amount: Number(item.amount || 0),
            method:
              item.withdrawal_method ||
              item.method ||
              'Unknown',
            accountDetails:
              item.account_details ||
              item.accountDetails ||
              '',
            status:
              item.status === 'approved'
                ? 'approved'
                : item.status === 'rejected'
                  ? 'rejected'
                  : 'pending',
            createdAt:
              item.created_at ||
              new Date().toISOString(),
            reviewedAt:
              item.reviewed_at || undefined,
            reviewedBy:
              item.reviewed_by || undefined,
            reviewedByName:
              item.reviewed_by_name || undefined,
            rejectionReason:
              item.rejection_reason || undefined,
          })
        );
      }

      this.persist();
    } catch (error) {
      console.error(
        'Failed to load admin data from Supabase:',
        error
      );
    }
  }

  private setupRealtime(): void {
    try {
      if (this.realtimeChannel) {
        supabase.removeChannel(this.realtimeChannel);
      }

      this.realtimeChannel = supabase
        .channel('admin-portal-realtime')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'payment_proofs',
          },
          () => {
            window.setTimeout(() => {
              void this.loadFromSupabase();
            }, 300);
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'withdrawals',
          },
          () => {
            window.setTimeout(() => {
              void this.loadFromSupabase();
            }, 300);
          }
        )
        .subscribe();
    } catch (error) {
      console.error(
        'Failed to setup admin realtime:',
        error
      );
    }
  }

  private async resolveAdminId(): Promise<string | null> {
    try {
      const currentAdmin =
        adminAuthService.getCurrentAdmin();

      if (currentAdmin?.id) {
        return currentAdmin.id;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user?.id) {
        return session.user.id;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user?.id) {
        return user.id;
      }

      return null;
    } catch (error) {
      console.error(
        'Failed to resolve admin ID:',
        error
      );

      return null;
    }
  }

  getDeposits(): DepositItem[] {
    return [...this.deposits];
  }

  getWithdrawals(): WithdrawalItem[] {
    return [...this.withdrawals];
  }

  getActivities(): AdminActivity[] {
    return [...this.activities];
  }

  getNotifications(): AdminNotification[] {
    return [...this.notifications];
  }

  getDashboardSummary(): DashboardSummary {
    const pendingDeposits = this.deposits.filter(
      item => item.status === 'pending'
    );

    const pendingWithdrawals = this.withdrawals.filter(
      item => item.status === 'pending'
    );

    const totalDeposits = this.deposits
      .filter(item => item.status === 'approved')
      .reduce(
        (total, item) => total + Number(item.amount || 0),
        0
      );

    const totalWithdrawals = this.withdrawals
      .filter(item => item.status === 'approved')
      .reduce(
        (total, item) => total + Number(item.amount || 0),
        0
      );

    return {
      totalMembers: 0,
      activeMembers: 0,
      pendingDeposits: pendingDeposits.length,
      pendingWithdrawals: pendingWithdrawals.length,
      totalDeposits,
      totalWithdrawals,
      totalRevenue: totalDeposits - totalWithdrawals,
    };
  }

  async approveDeposit(
    id: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (!id) {
        return {
          success: false,
          error: 'Invalid payment proof ID.',
        };
      }

      const currentAdminId =
        await this.resolveAdminId();

      if (!currentAdminId) {
        return {
          success: false,
          error: 'Admin session not found.',
        };
      }

      const { error } = await supabase.rpc(
        'admin_approve_payment',
        {
          p_proof_id: id,
          p_actor_id: currentAdminId,
        }
      );

      if (error) {
        console.error(
          'Approve deposit RPC error:',
          error
        );

        return {
          success: false,
          error: error.message || 'Failed to approve payment.',
        };
      }

      const depositIndex = this.deposits.findIndex(
        item => item.id === id
      );

      if (depositIndex !== -1) {
        const deposit = this.deposits[depositIndex];

        this.deposits[depositIndex] = {
          ...deposit,
          status: 'approved',
          reviewedAt: new Date().toISOString(),
          reviewedBy: currentAdminId,
        };

        this.activities.unshift({
          id: crypto.randomUUID(),
          type: 'deposit_approved',
          title: 'Deposit Approved',
          description: `${deposit.userName}'s deposit of ${deposit.amount} was approved.`,
          timestamp: new Date().toISOString(),
          adminId: currentAdminId,
          adminName:
            adminAuthService.getCurrentAdmin()?.name ||
            'Admin',
        });

        this.notifications.unshift({
          id: crypto.randomUUID(),
          title: 'Deposit Approved',
          message: `Deposit from ${deposit.userName} has been approved.`,
          type: 'success',
          createdAt: new Date().toISOString(),
          read: false,
        });
      }

      devStore.save({
        adminDeposits: this.deposits,
        adminWithdrawals: this.withdrawals,
      });

      this.persist();

      return {
        success: true,
      };
    } catch (error: any) {
      console.error(
        'Failed to approve deposit:',
        error
      );

      return {
        success: false,
        error:
          error?.message ||
          'Failed to approve deposit.',
      };
    }
  }

  async rejectDeposit(
    id: string,
    reason?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (!id) {
        return {
          success: false,
          error: 'Invalid payment proof ID.',
        };
      }

      const currentAdminId =
        await this.resolveAdminId();

      if (!currentAdminId) {
        return {
          success: false,
          error: 'Admin session not found.',
        };
      }

      const now = new Date().toISOString();

      const { error } = await supabase
        .from('payment_proofs')
        .update({
          status: 'rejected',
          reviewed_at: now,
          reviewed_by: currentAdminId,
          rejection_reason: reason || null,
        })
        .eq('id', id);

      if (error) {
        console.error(
          'Reject deposit error:',
          error
        );

        return {
          success: false,
          error:
            error.message ||
            'Failed to reject payment.',
        };
      }

      const depositIndex = this.deposits.findIndex(
        item => item.id === id
      );

      if (depositIndex !== -1) {
        const deposit = this.deposits[depositIndex];

        this.deposits[depositIndex] = {
          ...deposit,
          status: 'rejected',
          reviewedAt: now,
          reviewedBy: currentAdminId,
          rejectionReason: reason,
        };

        this.activities.unshift({
          id: crypto.randomUUID(),
          type: 'deposit_rejected',
          title: 'Deposit Rejected',
          description: `${deposit.userName}'s deposit of ${deposit.amount} was rejected.`,
          timestamp: now,
          adminId: currentAdminId,
          adminName:
            adminAuthService.getCurrentAdmin()?.name ||
            'Admin',
        });

        this.notifications.unshift({
          id: crypto.randomUUID(),
          title: 'Deposit Rejected',
          message: `Deposit from ${deposit.userName} has been rejected.`,
          type: 'warning',
          createdAt: now,
          read: false,
        });
      }

      devStore.save({
        adminDeposits: this.deposits,
        adminWithdrawals: this.withdrawals,
      });

      this.persist();

      return {
        success: true,
      };
    } catch (error: any) {
      console.error(
        'Failed to reject deposit:',
        error
      );

      return {
        success: false,
        error:
          error?.message ||
          'Failed to reject deposit.',
      };
    }
  }

  async approveWithdrawal(
    id: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (!id) {
        return {
          success: false,
          error: 'Invalid withdrawal ID.',
        };
      }

      const currentAdminId =
        await this.resolveAdminId();

      if (!currentAdminId) {
        return {
          success: false,
          error: 'Admin session not found.',
        };
      }

      const now = new Date().toISOString();

      const { error } = await supabase
        .from('withdrawals')
        .update({
          status: 'approved',
          reviewed_at: now,
          reviewed_by: currentAdminId,
        })
        .eq('id', id);

      if (error) {
        console.error(
          'Approve withdrawal error:',
          error
        );

        return {
          success: false,
          error:
            error.message ||
            'Failed to approve withdrawal.',
        };
      }

      const withdrawalIndex =
        this.withdrawals.findIndex(
          item => item.id === id
        );

      if (withdrawalIndex !== -1) {
        const withdrawal =
          this.withdrawals[withdrawalIndex];

        this.withdrawals[withdrawalIndex] = {
          ...withdrawal,
          status: 'approved',
          reviewedAt: now,
          reviewedBy: currentAdminId,
        };

        this.activities.unshift({
          id: crypto.randomUUID(),
          type: 'withdrawal_approved',
          title: 'Withdrawal Approved',
          description: `${withdrawal.userName}'s withdrawal of ${withdrawal.amount} was approved.`,
          timestamp: now,
          adminId: currentAdminId,
          adminName:
            adminAuthService.getCurrentAdmin()?.name ||
            'Admin',
        });

        this.notifications.unshift({
          id: crypto.randomUUID(),
          title: 'Withdrawal Approved',
          message: `Withdrawal from ${withdrawal.userName} has been approved.`,
          type: 'success',
          createdAt: now,
          read: false,
        });
      }

      devStore.save({
        adminDeposits: this.deposits,
        adminWithdrawals: this.withdrawals,
      });

      this.persist();

      return {
        success: true,
      };
    } catch (error: any) {
      console.error(
        'Failed to approve withdrawal:',
        error
      );

      return {
        success: false,
        error:
          error?.message ||
          'Failed to approve withdrawal.',
      };
    }
  }

  async rejectWithdrawal(
    id: string,
    reason?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (!id) {
        return {
          success: false,
          error: 'Invalid withdrawal ID.',
        };
      }

      const currentAdminId =
        await this.resolveAdminId();

      if (!currentAdminId) {
        return {
          success: false,
          error: 'Admin session not found.',
        };
      }

      const now = new Date().toISOString();

      const { error } = await supabase
        .from('withdrawals')
        .update({
          status: 'rejected',
          reviewed_at: now,
          reviewed_by: currentAdminId,
          rejection_reason: reason || null,
        })
        .eq('id', id);

      if (error) {
        console.error(
          'Reject withdrawal error:',
          error
        );

        return {
          success: false,
          error:
            error.message ||
            'Failed to reject withdrawal.',
        };
      }

      const withdrawalIndex =
        this.withdrawals.findIndex(
          item => item.id === id
        );

      if (withdrawalIndex !== -1) {
        const withdrawal =
          this.withdrawals[withdrawalIndex];

        this.withdrawals[withdrawalIndex] = {
          ...withdrawal,
          status: 'rejected',
          reviewedAt: now,
          reviewedBy: currentAdminId,
          rejectionReason: reason,
        };

        this.activities.unshift({
          id: crypto.randomUUID(),
          type: 'withdrawal_rejected',
          title: 'Withdrawal Rejected',
          description: `${withdrawal.userName}'s withdrawal of ${withdrawal.amount} was rejected.`,
          timestamp: now,
          adminId: currentAdminId,
          adminName:
            adminAuthService.getCurrentAdmin()?.name ||
            'Admin',
        });

        this.notifications.unshift({
          id: crypto.randomUUID(),
          title: 'Withdrawal Rejected',
          message: `Withdrawal from ${withdrawal.userName} has been rejected.`,
          type: 'warning',
          createdAt: now,
          read: false,
        });
      }

      devStore.save({
        adminDeposits: this.deposits,
        adminWithdrawals: this.withdrawals,
      });

      this.persist();

      return {
        success: true,
      };
    } catch (error: any) {
      console.error(
        'Failed to reject withdrawal:',
        error
      );

      return {
        success: false,
        error:
          error?.message ||
          'Failed to reject withdrawal.',
      };
    }
  }

  async refresh(): Promise<void> {
    await this.loadFromSupabase();
  }

  destroy(): void {
    if (this.realtimeChannel) {
      supabase.removeChannel(this.realtimeChannel);
      this.realtimeChannel = null;
    }
  }
}

export const adminPortalService =
  new AdminPortalService();
