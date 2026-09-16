import { devStore } from '../store/devStore';
import { adminService } from './adminService';
import { supabase } from '../lib/supabase';
import { PayoutMethod, PaymentMethod } from '../types';

export interface DepositItem {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  paymentMethod: string;
  transactionId: string;
  senderName: string;
  senderAccount: string;
  receiptUrl: string;
  userNotes?: string;
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  reviewedAt?: string;
}

export interface WithdrawalItem {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  grossAmount: number;
  feeAmount: number;
  netAmount: number;
  withdrawalMethod: string;
  accountTitle: string;
  accountNumber: string;
  userNote?: string;
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  processedAt?: string;
  transactionRef?: string;
}

export interface AdminActivity {
  id: string;
  type:
    | 'deposit_uploaded'
    | 'deposit_approved'
    | 'deposit_rejected'
    | 'withdrawal_requested'
    | 'withdrawal_approved'
    | 'withdrawal_rejected';
  title: string;
  description: string;
  amount?: number;
  targetId: string;
  timestamp: string;
  userFullName?: string;
}

export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  type: 'deposit' | 'withdrawal' | 'security' | 'system';
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

export interface DashboardSummary {
  totalDepositsAmount: number;
  totalDepositsCount: number;
  pendingDepositsAmount: number;
  pendingDepositsCount: number;
  totalWithdrawalsAmount: number;
  totalWithdrawalsCount: number;
  pendingWithdrawalsAmount: number;
  pendingWithdrawalsCount: number;
}

// Real Supabase storage keys - no demo data
const LOCAL_STORAGE_DEPOSITS_KEY = 'dsn_admin_deposits_v3';
const LOCAL_STORAGE_WITHDRAWALS_KEY = 'dsn_admin_withdrawals_v3';
const LOCAL_STORAGE_ACTIVITIES_KEY = 'dsn_admin_activities_v3';
const LOCAL_STORAGE_NOTIFS_KEY = 'dsn_admin_notifs_v3';

// Empty initial states - no fake or demo records
const INITIAL_DEPOSITS: DepositItem[] = [];
const INITIAL_WITHDRAWALS: WithdrawalItem[] = [];
const INITIAL_ACTIVITIES: AdminActivity[] = [];
const INITIAL_NOTIFICATIONS: AdminNotification[] = [];

class AdminPortalService {
  private deposits: DepositItem[] = [];
  private withdrawals: WithdrawalItem[] = [];
  private activities: AdminActivity[] = [];
  private notifications: AdminNotification[] = [];
  private isLoadedFromSupabase = false;

  constructor() {
    this.init();
    // Load real records from Supabase asynchronously
    this.loadFromSupabase();
  }

  private init() {
    if (typeof window === 'undefined') return;

    try {
      // Purge old demo storage keys if present
      localStorage.removeItem('dsn_admin_deposits_v1');
      localStorage.removeItem('dsn_admin_withdrawals_v1');
      localStorage.removeItem('dsn_admin_activities_v1');
      localStorage.removeItem('dsn_admin_notifs_v1');

      const savedDep = localStorage.getItem(LOCAL_STORAGE_DEPOSITS_KEY);
      this.deposits = savedDep ? JSON.parse(savedDep) : [];

      const savedWd = localStorage.getItem(LOCAL_STORAGE_WITHDRAWALS_KEY);
      this.withdrawals = savedWd ? JSON.parse(savedWd) : [];

      const savedAct = localStorage.getItem(LOCAL_STORAGE_ACTIVITIES_KEY);
      this.activities = savedAct ? JSON.parse(savedAct) : [];

      const savedNot = localStorage.getItem(LOCAL_STORAGE_NOTIFS_KEY);
      this.notifications = savedNot ? JSON.parse(savedNot) : [];

      // Filter out any leftover fake IDs
      this.deposits = this.deposits.filter(d => !d.id.startsWith('DEP-982'));
      this.withdrawals = this.withdrawals.filter(w => !w.id.startsWith('WD-847'));
      this.activities = this.activities.filter(a => !['act-1', 'act-2', 'act-3', 'act-4', 'act-5', 'act-6', 'act-7'].includes(a.id));
      this.notifications = this.notifications.filter(n => !['notif-1', 'notif-2', 'notif-3', 'notif-4', 'notif-5', 'notif-6'].includes(n.id));
    } catch {
      this.deposits = [];
      this.withdrawals = [];
      this.activities = [];
      this.notifications = [];
    }
  }

  /**
   * Fetch real deposits, withdrawals and data directly from Supabase
   */
  async loadFromSupabase(): Promise<void> {
    try {
      // 1. Fetch real deposit/payment proofs
      const { data: proofs, error: pError } = await supabase
        .from('payment_proofs')
        .select('*')
        .order('date_submitted', { ascending: false });

      if (!pError && Array.isArray(proofs)) {
        this.deposits = proofs.map(p => ({
          id: p.id,
          userId: p.user_id,
          userName: p.user_full_name || 'Member',
          userEmail: p.user_email || '',
          amount: Number(p.amount) || 1300,
          paymentMethod: p.payment_method || 'Direct Transfer',
          transactionId: p.transaction_id || p.id,
          senderName: p.sender_name || p.user_full_name || '',
          senderAccount: p.sender_account || '',
          receiptUrl: p.screenshot_url || '',
          userNotes: p.notes || '',
          createdAt: p.date_submitted || p.created_at || new Date().toISOString(),
          status: p.status === 'verified' || p.status === 'approved' ? 'approved' : p.status === 'rejected' ? 'rejected' : 'pending',
          rejectionReason: p.rejection_reason,
          reviewedAt: p.reviewed_at
        }));
      }

      // 2. Fetch real withdrawals
      const { data: wds, error: wError } = await supabase
        .from('withdrawals')
        .select('*')
        .order('created_at', { ascending: false });

      if (!wError && Array.isArray(wds)) {
        this.withdrawals = wds.map(w => ({
          id: w.id,
          userId: w.user_id,
          userName: w.user_full_name || 'Member',
          userEmail: '',
          grossAmount: Number(w.gross_amount) || Number(w.amount) || 0,
          feeAmount: Number(w.fee_amount) || 0,
          netAmount: Number(w.net_amount) || 0,
          withdrawalMethod: w.payment_method || 'Mobile Wallet',
          accountTitle: w.account_title || '',
          accountNumber: w.account_number || '',
          userNote: w.user_note || '',
          createdAt: w.created_at || new Date().toISOString(),
          status: w.status === 'approved' || w.status === 'paid' ? 'approved' : w.status === 'rejected' ? 'rejected' : 'pending',
          rejectionReason: w.remarks || w.rejection_reason,
          processedAt: w.processed_at,
          transactionRef: w.remarks
        }));
      }

      this.isLoadedFromSupabase = true;
      this.persist();
    } catch (err) {
      console.warn('Supabase data synchronization:', err);
    }
  }

  private persist() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(LOCAL_STORAGE_DEPOSITS_KEY, JSON.stringify(this.deposits));
      localStorage.setItem(LOCAL_STORAGE_WITHDRAWALS_KEY, JSON.stringify(this.withdrawals));
      localStorage.setItem(LOCAL_STORAGE_ACTIVITIES_KEY, JSON.stringify(this.activities));
      localStorage.setItem(LOCAL_STORAGE_NOTIFS_KEY, JSON.stringify(this.notifications));
    } catch (e) {
      console.warn('Could not persist admin portal data:', e);
    }
  }

  // Summary Metrics
  getDashboardSummary(): DashboardSummary {
    const totalDeposits = this.deposits;
    const totalDepositsAmount = totalDeposits
      .filter(d => d.status === 'approved')
      .reduce((sum, d) => sum + d.amount, 0);

    const pendingDeposits = this.deposits.filter(d => d.status === 'pending');
    const pendingDepositsAmount = pendingDeposits.reduce((sum, d) => sum + d.amount, 0);

    const totalWithdrawals = this.withdrawals;
    const totalWithdrawalsAmount = totalWithdrawals
      .filter(w => w.status === 'approved')
      .reduce((sum, w) => sum + w.grossAmount, 0);

    const pendingWithdrawals = this.withdrawals.filter(w => w.status === 'pending');
    const pendingWithdrawalsAmount = pendingWithdrawals.reduce((sum, w) => sum + w.grossAmount, 0);

    return {
      totalDepositsAmount,
      totalDepositsCount: totalDeposits.filter(d => d.status === 'approved').length,
      pendingDepositsAmount,
      pendingDepositsCount: pendingDeposits.length,
      totalWithdrawalsAmount,
      totalWithdrawalsCount: totalWithdrawals.filter(w => w.status === 'approved').length,
      pendingWithdrawalsAmount,
      pendingWithdrawalsCount: pendingWithdrawals.length
    };
  }

  // Deposits
  getDeposits(statusFilter?: 'all' | 'pending' | 'approved' | 'rejected'): DepositItem[] {
    if (!statusFilter || statusFilter === 'all') {
      return [...this.deposits];
    }
    return this.deposits.filter(d => d.status === statusFilter);
  }

  getDepositById(id: string): DepositItem | undefined {
    return this.deposits.find(d => d.id === id);
  }

  async approveDeposit(id: string, actorName = 'Central Admin'): Promise<{ success: boolean; error?: string }> {
    const item = this.deposits.find(d => d.id === id);
    if (!item) return { success: false, error: 'Deposit request not found.' };

    item.status = 'approved';
    item.reviewedAt = new Date().toISOString();

    // Persist to Supabase
    try {
      await supabase
        .from('payment_proofs')
        .update({
          status: 'verified',
          reviewed_at: item.reviewedAt,
          reviewed_by: actorName
        })
        .eq('id', id);

      if (item.userId) {
        await supabase
          .from('profiles')
          .update({
            account_status: 'active',
            payment_proof_status: 'approved'
          })
          .eq('id', item.userId);
      }
    } catch (e) {
      console.warn('Supabase status update error:', e);
    }

    // Add activity
    this.activities.unshift({
      id: `act-${Date.now()}`,
      type: 'deposit_approved',
      title: 'Payment approved',
      description: `Payment of ${item.amount.toLocaleString()} PKR approved for ${item.userName} (Trx: ${item.transactionId})`,
      amount: item.amount,
      targetId: item.id,
      timestamp: new Date().toISOString(),
      userFullName: item.userName
    });

    // Add notification
    this.notifications.unshift({
      id: `notif-${Date.now()}`,
      title: 'Payment approved',
      message: `Deposit of ${item.amount} PKR for ${item.userName} was verified and approved by ${actorName}.`,
      type: 'deposit',
      read: false,
      createdAt: new Date().toISOString(),
      actionUrl: '/admin/deposits'
    });

    this.persist();
    return { success: true };
  }

  async rejectDeposit(id: string, reason: string, actorName = 'Central Admin'): Promise<{ success: boolean; error?: string }> {
    const item = this.deposits.find(d => d.id === id);
    if (!item) return { success: false, error: 'Deposit request not found.' };

    item.status = 'rejected';
    item.rejectionReason = reason;
    item.reviewedAt = new Date().toISOString();

    // Persist to Supabase
    try {
      await supabase
        .from('payment_proofs')
        .update({
          status: 'rejected',
          rejection_reason: reason,
          reviewed_at: item.reviewedAt,
          reviewed_by: actorName
        })
        .eq('id', id);

      if (item.userId) {
        await supabase
          .from('profiles')
          .update({
            payment_proof_status: 'rejected'
          })
          .eq('id', item.userId);
      }
    } catch (e) {
      console.warn('Supabase reject status error:', e);
    }

    // Add activity
    this.activities.unshift({
      id: `act-${Date.now()}`,
      type: 'deposit_rejected',
      title: 'Payment rejected',
      description: `Deposit rejected for ${item.userName}. Reason: ${reason}`,
      amount: item.amount,
      targetId: item.id,
      timestamp: new Date().toISOString(),
      userFullName: item.userName
    });

    // Add notification
    this.notifications.unshift({
      id: `notif-${Date.now()}`,
      title: 'Payment rejected',
      message: `Deposit for ${item.userName} was rejected: ${reason}`,
      type: 'deposit',
      read: false,
      createdAt: new Date().toISOString(),
      actionUrl: '/admin/deposits'
    });

    this.persist();
    return { success: true };
  }

  // Withdrawals
  getWithdrawals(statusFilter?: 'all' | 'pending' | 'approved' | 'rejected'): WithdrawalItem[] {
    if (!statusFilter || statusFilter === 'all') {
      return [...this.withdrawals];
    }
    return this.withdrawals.filter(w => w.status === statusFilter);
  }

  getWithdrawalById(id: string): WithdrawalItem | undefined {
    return this.withdrawals.find(w => w.id === id);
  }

  async approveWithdrawal(id: string, transactionRef = 'MANUAL-PAYOUT', actorName = 'Central Admin'): Promise<{ success: boolean; error?: string }> {
    const item = this.withdrawals.find(w => w.id === id);
    if (!item) return { success: false, error: 'Withdrawal request not found.' };

    item.status = 'approved';
    item.processedAt = new Date().toISOString();
    item.transactionRef = transactionRef;

    // Persist to Supabase
    try {
      await supabase
        .from('withdrawals')
        .update({
          status: 'paid',
          processed_at: item.processedAt,
          remarks: `Ref: ${transactionRef}`
        })
        .eq('id', id);
    } catch (e) {
      console.warn('Supabase withdrawal approve error:', e);
    }

    // Add activity
    this.activities.unshift({
      id: `act-${Date.now()}`,
      type: 'withdrawal_approved',
      title: 'Withdrawal approved',
      description: `Disbursed ${item.netAmount.toLocaleString()} PKR to ${item.userName} via ${item.withdrawalMethod} (Ref: ${transactionRef})`,
      amount: item.grossAmount,
      targetId: item.id,
      timestamp: new Date().toISOString(),
      userFullName: item.userName
    });

    // Add notification
    this.notifications.unshift({
      id: `notif-${Date.now()}`,
      title: 'Withdrawal approved',
      message: `Payout of ${item.netAmount} PKR to ${item.userName} (${item.withdrawalMethod}) confirmed.`,
      type: 'withdrawal',
      read: false,
      createdAt: new Date().toISOString(),
      actionUrl: '/admin/withdrawals'
    });

    this.persist();
    return { success: true };
  }

  async rejectWithdrawal(id: string, reason: string, actorName = 'Central Admin'): Promise<{ success: boolean; error?: string }> {
    const item = this.withdrawals.find(w => w.id === id);
    if (!item) return { success: false, error: 'Withdrawal request not found.' };

    item.status = 'rejected';
    item.rejectionReason = reason;

    // Persist to Supabase
    try {
      await supabase
        .from('withdrawals')
        .update({
          status: 'rejected',
          remarks: reason
        })
        .eq('id', id);
    } catch (e) {
      console.warn('Supabase withdrawal reject error:', e);
    }

    // Add activity
    this.activities.unshift({
      id: `act-${Date.now()}`,
      type: 'withdrawal_rejected',
      title: 'Withdrawal rejected',
      description: `Withdrawal of ${item.grossAmount.toLocaleString()} PKR rejected for ${item.userName}. Reason: ${reason}`,
      amount: item.grossAmount,
      targetId: item.id,
      timestamp: new Date().toISOString(),
      userFullName: item.userName
    });

    // Add notification
    this.notifications.unshift({
      id: `notif-${Date.now()}`,
      title: 'Withdrawal rejected',
      message: `Withdrawal request for ${item.userName} was rejected (${reason}).`,
      type: 'withdrawal',
      read: false,
      createdAt: new Date().toISOString(),
      actionUrl: '/admin/withdrawals'
    });

    this.persist();
    return { success: true };
  }

  // Activities
  getRecentActivities(): AdminActivity[] {
    return [...this.activities].slice(0, 15);
  }

  // Notifications
  getNotifications(): AdminNotification[] {
    return [...this.notifications];
  }

  getUnreadNotificationsCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  markNotificationRead(id: string): void {
    const n = this.notifications.find(item => item.id === id);
    if (n) {
      n.read = true;
      this.persist();
    }
  }

  markAllNotificationsRead(): void {
    this.notifications.forEach(n => {
      n.read = true;
    });
    this.persist();
  }
}

export const adminPortalService = new AdminPortalService();
