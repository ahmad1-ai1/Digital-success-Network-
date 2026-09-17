```typescript
import { devStore } from '../store/devStore';
import { adminAuthService } from './adminAuthService';
import { supabase } from '../lib/supabase';

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

const LOCAL_STORAGE_DEPOSITS_KEY = 'dsn_admin_deposits_v3';
const LOCAL_STORAGE_WITHDRAWALS_KEY = 'dsn_admin_withdrawals_v3';
const LOCAL_STORAGE_ACTIVITIES_KEY = 'dsn_admin_activities_v3';
const LOCAL_STORAGE_NOTIFS_KEY = 'dsn_admin_notifs_v3';

class AdminPortalService {
  private deposits: DepositItem[] = [];
  private withdrawals: WithdrawalItem[] = [];
  private activities: AdminActivity[] = [];
  private notifications: AdminNotification[] = [];

  private isLoadedFromSupabase = false;
  private realtimeChannel: ReturnType<typeof supabase.channel> | null = null;
  private loadPromise: Promise<void> | null = null;

  constructor() {
    this.initLocalState();
    this.loadFromSupabase();
    this.setupRealtime();
  }

  private initLocalState(): void {
    if (typeof window === 'undefined') return;

    try {
      // Remove old/demo storage versions.
      localStorage.removeItem('dsn_admin_deposits_v1');
      localStorage.removeItem('dsn_admin_withdrawals_v1');
      localStorage.removeItem('dsn_admin_activities_v1');
      localStorage.removeItem('dsn_admin_notifs_v1');

      const savedDep = localStorage.getItem(LOCAL_STORAGE_DEPOSITS_KEY);
      const savedWd = localStorage.getItem(LOCAL_STORAGE_WITHDRAWALS_KEY);
      const savedAct = localStorage.getItem(LOCAL_STORAGE_ACTIVITIES_KEY);
      const savedNot = localStorage.getItem(LOCAL_STORAGE_NOTIFS_KEY);

      this.deposits = savedDep ? JSON.parse(savedDep) : [];
      this.withdrawals = savedWd ? JSON.parse(savedWd) : [];
      this.activities = savedAct ? JSON.parse(savedAct) : [];
      this.notifications = savedNot ? JSON.parse(savedNot) : [];

      // Remove known fake/demo records.
      this.deposits = this.deposits.filter(
        d => !d.id.startsWith('DEP-982')
      );

      this.withdrawals = this.withdrawals.filter(
        w => !w.id.startsWith('WD-847')
      );

      this.activities = this.activities.filter(
        a =>
          ![
            'act-1',
            'act-2',
            'act-3',
            'act-4',
            'act-5',
            'act-6',
            'act-7'
          ].includes(a.id)
      );

      this.notifications = this.notifications.filter(
        n =>
          ![
            'notif-1',
            'notif-2',
            'notif-3',
            'notif-4',
            'notif-5',
            'notif-6'
          ].includes(n.id)
      );
    } catch (error) {
      console.warn('Could not load admin local state:', error);

      this.deposits = [];
      this.withdrawals = [];
      this.activities = [];
      this.notifications = [];
    }
  }

  /**
   * Public refresh method.
   *
   * Call this whenever the admin dashboard opens or when you want
   * to manually force a fresh Supabase read.
   */
  async refresh(): Promise<void> {
    await this.loadFromSupabase();
  }

  /**
   * Load real payment proofs and withdrawals from Supabase.
   *
   * Supabase is the source of truth.
   * LocalStorage is NOT allowed to overwrite fresh database data.
   */
  async loadFromSupabase(): Promise<void> {
    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = this.performSupabaseLoad();

    try {
      await this.loadPromise;
    } finally {
      this.loadPromise = null;
    }
  }

  private async performSupabaseLoad(): Promise<void> {
    try {
      /*
       * ============================================================
       * 1. PAYMENT PROOFS
       * ============================================================
       *
       * We intentionally do NOT depend on date_submitted existing.
       * First try created_at, then fallback to an unordered query.
       */

      let proofs: any[] | null = null;
      let proofError: any = null;

      const firstProofQuery = await supabase
        .from('payment_proofs')
        .select('*')
        .order('created_at', { ascending: false });

      proofs = firstProofQuery.data;
      proofError = firstProofQuery.error;

      /*
       * Fallback:
       * If created_at is missing or another query issue occurs,
       * fetch the table without an ORDER BY.
       */
      if (proofError) {
        console.warn(
          'Primary payment_proofs query failed. Trying fallback query:',
          proofError.message
        );

        const fallbackProofQuery = await supabase
          .from('payment_proofs')
          .select('*');

        proofs = fallbackProofQuery.data;
        proofError = fallbackProofQuery.error;
      }

      if (proofError) {
        console.error(
          'Could not load payment_proofs from Supabase:',
          proofError
        );
      } else if (Array.isArray(proofs)) {
        const mappedDeposits: DepositItem[] = proofs
          .map((p: any) => {
            const rawStatus = String(p.status || 'pending').toLowerCase();

            let status: DepositItem['status'] = 'pending';

            if (
              rawStatus === 'approved' ||
              rawStatus === 'verified' ||
              rawStatus === 'active'
            ) {
              status = 'approved';
            } else if (rawStatus === 'rejected') {
              status = 'rejected';
            }

            const createdAt =
              p.date_submitted ||
              p.created_at ||
              p.submitted_at ||
              new Date().toISOString();

            return {
              id: String(p.id),
              userId: String(p.user_id || ''),
              userName:
                p.user_full_name ||
                p.full_name ||
                p.sender_name ||
                'Member',
              userEmail:
                p.user_email ||
                p.email ||
                '',
              amount: Number(p.amount) || 0,
              paymentMethod:
                p.payment_method ||
                p.method ||
                'Direct Transfer',
              transactionId:
                p.transaction_id ||
                p.transaction_ref ||
                p.id,
              senderName:
                p.sender_name ||
                p.user_full_name ||
                p.full_name ||
                '',
              senderAccount:
                p.sender_account ||
                p.sender_account_number ||
                p.account_number ||
                '',
              receiptUrl:
                p.screenshot_url ||
                p.receipt_url ||
                p.payment_screenshot ||
                '',
              userNotes:
                p.notes ||
                p.user_notes ||
                p.note ||
                '',
              createdAt,
              status,
              rejectionReason:
                p.rejection_reason ||
                p.rejectionReason ||
                undefined,
              reviewedAt:
                p.reviewed_at ||
                p.reviewedAt ||
                undefined
            };
          })
          .filter((p: DepositItem) => Boolean(p.id));

        /*
         * Always sort on the client.
         * This works even when created_at/date_submitted differs
         * between database versions.
         */
        mappedDeposits.sort((a, b) => {
          const aTime = new Date(a.createdAt).getTime();
          const bTime = new Date(b.createdAt).getTime();

          return (
            (Number.isFinite(bTime) ? bTime : 0) -
            (Number.isFinite(aTime) ? aTime : 0)
          );
        });

        this.deposits = mappedDeposits;

        console.log(
  '[AdminPortal] Loaded ' +
    mappedDeposits.length +
    ' payment proof(s) from Supabase.'
);
      /*
       * ============================================================
       * 2. WITHDRAWALS
       * ============================================================
       */

      let withdrawals: any[] | null = null;
      let withdrawalError: any = null;

      const withdrawalQuery = await supabase
        .from('withdrawals')
        .select('*')
        .order('created_at', { ascending: false });

      withdrawals = withdrawalQuery.data;
      withdrawalError = withdrawalQuery.error;

      if (withdrawalError) {
        console.warn(
          'Could not load withdrawals:',
          withdrawalError.message
        );
      } else if (Array.isArray(withdrawals)) {
        this.withdrawals = withdrawals
          .map((w: any) => {
            const rawStatus = String(w.status || 'pending').toLowerCase();

            let status: WithdrawalItem['status'] = 'pending';

            if (
              rawStatus === 'approved' ||
              rawStatus === 'paid'
            ) {
              status = 'approved';
            } else if (rawStatus === 'rejected') {
              status = 'rejected';
            }

            return {
              id: String(w.id),
              userId: String(w.user_id || ''),
              userName:
                w.user_full_name ||
                w.full_name ||
                'Member',
              userEmail:
                w.user_email ||
                w.email ||
                '',
              grossAmount:
                Number(w.gross_amount) ||
                Number(w.amount) ||
                0,
              feeAmount:
                Number(w.fee_amount) ||
                0,
              netAmount:
                Number(w.net_amount) ||
                0,
              withdrawalMethod:
                w.payment_method ||
                w.withdrawal_method ||
                'Mobile Wallet',
              accountTitle:
                w.account_title ||
                '',
              accountNumber:
                w.account_number ||
                '',
              userNote:
                w.user_note ||
                w.notes ||
                '',
              createdAt:
                w.created_at ||
                new Date().toISOString(),
              status,
              rejectionReason:
                w.remarks ||
                w.rejection_reason ||
                undefined,
              processedAt:
                w.processed_at ||
                undefined,
              transactionRef:
                w.transaction_ref ||
                w.remarks ||
                undefined
            };
          })
          .filter((w: WithdrawalItem) => Boolean(w.id));
      }

      this.isLoadedFromSupabase = !proofError;

      /*
       * IMPORTANT:
       * Do not replace Supabase data with localStorage.
       * LocalStorage is only a cache for activities/notifications.
       */
      this.persist();

      console.log(
  '[AdminPortal] Supabase sync complete. Deposits: ' +
    this.deposits.length +
    ', Withdrawals: ' +
    this.withdrawals.length
);
    } catch (error) {
      console.error(
        '[AdminPortal] Supabase synchronization error:',
        error
      );
    }
  }

  /**
   * Realtime listener.
   *
   * When a member submits a new payment proof,
   * this automatically reloads the admin data.
   */
  private setupRealtime(): void {
    if (typeof window === 'undefined') return;

    try {
      if (this.realtimeChannel) {
        supabase.removeChannel(this.realtimeChannel);
      }

      this.realtimeChannel = supabase
        .channel('dsn-admin-payment-proofs')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'payment_proofs'
          },
          payload => {
            console.log(
              '[AdminPortal] Payment proof database change detected:',
              payload.eventType
            );

            /*
             * Small delay allows Supabase transaction visibility
             * to settle before the fresh SELECT.
             */
            window.setTimeout(() => {
              this.loadFromSupabase();
            }, 300);
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'withdrawals'
          },
          payload => {
            console.log(
              '[AdminPortal] Withdrawal database change detected:',
              payload.eventType
            );

            window.setTimeout(() => {
              this.loadFromSupabase();
            }, 300);
          }
        )
        .subscribe(status => {
          console.log(
            '[AdminPortal] Realtime subscription status:',
            status
          );
        });
    } catch (error) {
      console.warn(
        '[AdminPortal] Could not setup realtime subscription:',
        error
      );
    }
  }

  private async resolveAdminId(): Promise<string | null> {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    // 1. Admin auth service
    try {
      const storedAdmin = adminAuthService.getCurrentAdmin();

      if (
        storedAdmin?.id &&
        uuidRegex.test(storedAdmin.id)
      ) {
        return storedAdmin.id;
      }
    } catch (error) {
      console.warn(
        'resolveAdminId: adminAuthService error:',
        error
      );
    }

    // 2. Supabase session
    try {
      const { data: sessionData } =
        await supabase.auth.getSession();

      const id = sessionData?.session?.user?.id;

      if (id && uuidRegex.test(id)) {
        return id;
      }
    } catch (error) {
      console.warn(
        'resolveAdminId: session error:',
        error
      );
    }

    // 3. Supabase current user
    try {
      const { data: userData } =
        await supabase.auth.getUser();

      const id = userData?.user?.id;

      if (id && uuidRegex.test(id)) {
        return id;
      }
    } catch (error) {
      console.warn(
        'resolveAdminId: getUser error:',
        error
      );
    }

    // 4. Admin profile fallback
    try {
      const { data: adminProf, error } =
        await supabase
          .from('profiles')
          .select('id')
          .eq('role', 'admin')
          .limit(1)
          .maybeSingle();

      if (
        !error &&
        adminProf?.id &&
        uuidRegex.test(adminProf.id)
      ) {
        return adminProf.id;
      }
    } catch (error) {
      console.warn(
        'resolveAdminId: profile fallback error:',
        error
      );
    }

    return null;
  }

  private persist(): void {
    if (typeof window === 'undefined') return;

    try {
      /*
       * Only cache the current real data.
       * This is NOT the source of truth.
       */
      localStorage.setItem(
        LOCAL_STORAGE_DEPOSITS_KEY,
        JSON.stringify(this.deposits)
      );

      localStorage.setItem(
        LOCAL_STORAGE_WITHDRAWALS_KEY,
        JSON.stringify(this.withdrawals)
      );

      localStorage.setItem(
        LOCAL_STORAGE_ACTIVITIES_KEY,
        JSON.stringify(this.activities)
      );

      localStorage.setItem(
        LOCAL_STORAGE_NOTIFS_KEY,
        JSON.stringify(this.notifications)
      );
    } catch (error) {
      console.warn(
        'Could not persist admin portal data:',
        error
      );
    }
  }

  // ============================================================
  // DASHBOARD
  // ============================================================

  getDashboardSummary(): DashboardSummary {
    const totalDepositsAmount = this.deposits
      .filter(d => d.status === 'approved')
      .reduce((sum, d) => sum + d.amount, 0);

    const pendingDeposits =
      this.deposits.filter(d => d.status === 'pending');

    const pendingDepositsAmount =
      pendingDeposits.reduce(
        (sum, d) => sum + d.amount,
        0
      );

    const totalWithdrawalsAmount =
      this.withdrawals
        .filter(w => w.status === 'approved')
        .reduce(
          (sum, w) => sum + w.grossAmount,
          0
        );

    const pendingWithdrawals =
      this.withdrawals.filter(
        w => w.status === 'pending'
      );

    const pendingWithdrawalsAmount =
      pendingWithdrawals.reduce(
        (sum, w) => sum + w.grossAmount,
        0
      );

    return {
      totalDepositsAmount,
      totalDepositsCount: this.deposits.filter(
        d => d.status === 'approved'
      ).length,

      pendingDepositsAmount,
      pendingDepositsCount: pendingDeposits.length,

      totalWithdrawalsAmount,
      totalWithdrawalsCount:
        this.withdrawals.filter(
          w => w.status === 'approved'
        ).length,

      pendingWithdrawalsAmount,
      pendingWithdrawalsCount:
        pendingWithdrawals.length
    };
  }

  // ============================================================
  // DEPOSITS
  // ============================================================

  getDeposits(
    statusFilter?:
      | 'all'
      | 'pending'
      | 'approved'
      | 'rejected'
  ): DepositItem[] {
    const list = [...this.deposits];

    if (
      !statusFilter ||
      statusFilter === 'all'
    ) {
      return list;
    }

    return list.filter(
      d => d.status === statusFilter
    );
  }

  getDepositById(
    id: string
  ): DepositItem | undefined {
    return this.deposits.find(
      d => d.id === id
    );
  }

  async approveDeposit(
    id: string,
    actorName = 'Central Admin'
  ): Promise<{
    success: boolean;
    error?: string;
  }> {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (!id || !uuidRegex.test(id)) {
      return {
        success: false,
        error:
          'Invalid payment proof ID: Must be a valid UUID.'
      };
    }

    const currentAdminId =
      await this.resolveAdminId();

    if (!currentAdminId) {
      return {
        success: false,
        error:
          'Unauthorized: Valid administrator UUID is required to execute database activation.'
      };
    }

    const { data: rpcData, error: rpcErr } =
      await supabase.rpc(
        'admin_approve_payment',
        {
          p_proof_id: id,
          p_actor_id: currentAdminId
        }
      );

    if (rpcErr) {
      console.error(
        'Supabase RPC admin_approve_payment failed:',
        rpcErr
      );

      return {
        success: false,
        error:
          rpcErr.message ||
          'Database approval RPC failed.'
      };
    }

    const rpcResult =
      rpcData as {
        success?: boolean;
        error?: string;
        message?: string;
      } | null;

    if (
      !rpcResult ||
      rpcResult.success === false
    ) {
      return {
        success: false,
        error:
          rpcResult?.error ||
          'Database rejected payment proof approval.'
      };
    }

    const item =
      this.deposits.find(d => d.id === id);

    const nowIso =
      new Date().toISOString();

    if (item) {
      item.status = 'approved';
      item.reviewedAt = nowIso;
    }

    this.activities.unshift({
      id: `act-${Date.now()}`,
      type: 'deposit_approved',
      title: 'Payment approved',
      description: `Payment of ${(item?.amount || 0).toLocaleString()} PKR approved for ${item?.userName || 'Member'} (Trx: ${item?.transactionId || id})`,
      amount: item?.amount || 0,
      targetId: id,
      timestamp: nowIso,
      userFullName:
        item?.userName || 'Member'
    });

    this.notifications.unshift({
      id: `notif-${Date.now()}`,
      title: 'Payment approved',
      message: `Deposit of ${item?.amount || 0} PKR for ${item?.userName || 'Member'} was verified and approved by ${actorName}.`,
      type: 'deposit',
      read: false,
      createdAt: nowIso,
      actionUrl: '/admin/deposits'
    });

    this.persist();

    // Keep legacy/dev state synchronized if present.
    devStore.save(db => {
      if (item?.userId) {
        if (db.profiles[item.userId]) {
          db.profiles[item.userId].accountStatus =
            'active';

          db.profiles[item.userId].paymentProofStatus =
            'approved';
        }

        const user = db.users.find(
          usr => usr.id === item.userId
        );

        if (user) {
          user.accountStatus = 'active';
          user.updatedAt = nowIso;
        }
      }

      const proof =
        db.paymentProofs.find(
          p => p.id === id
        );

      if (proof) {
        proof.status = 'approved';
        proof.reviewedAt = nowIso;
        proof.reviewedBy = currentAdminId;
      }
    });

    // Reload fresh database state.
    await this.loadFromSupabase();

    return { success: true };
  }

  async rejectDeposit(
    id: string,
    reason: string,
    actorName = 'Central Admin'
  ): Promise<{
    success: boolean;
    error?: string;
  }> {
    if (!reason || !reason.trim()) {
      return {
        success: false,
        error:
          'Please specify a rejection reason for the member.'
      };
    }

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (!id || !uuidRegex.test(id)) {
      return {
        success: false,
        error:
          'Invalid payment proof ID: Must be a valid UUID.'
      };
    }

    const currentAdminId =
      await this.resolveAdminId();

    if (!currentAdminId) {
      return {
        success: false,
        error:
          'Unauthorized: Valid administrator UUID is required to reject payment proof.'
      };
    }

    const item =
      this.deposits.find(d => d.id === id);

    const userId = item?.userId;
    const nowIso =
      new Date().toISOString();

    const { error: proofErr } =
      await supabase
        .from('payment_proofs')
        .update({
          status: 'rejected',
          rejection_reason: reason.trim(),
          reviewed_at: nowIso,
          reviewed_by: currentAdminId
        })
        .eq('id', id);

    if (proofErr) {
      console.error(
        'Supabase error rejecting payment_proof:',
        proofErr
      );

      return {
        success: false,
        error:
          proofErr.message ||
          'Database update failed for payment proof rejection.'
      };
    }

    if (userId) {
      const { error: profileError } =
        await supabase
          .from('profiles')
          .update({
            payment_proof_status: 'rejected',
            updated_at: nowIso
          })
          .eq('id', userId);

      if (profileError) {
        console.warn(
          'Could not update profile payment_proof_status:',
          profileError
        );
      }
    }

    if (item) {
      item.status = 'rejected';
      item.rejectionReason =
        reason.trim();
      item.reviewedAt = nowIso;
    }

    this.activities.unshift({
      id: `act-${Date.now()}`,
      type: 'deposit_rejected',
      title: 'Payment rejected',
      description: `Deposit rejected for ${item?.userName || 'Member'}. Reason: ${reason.trim()}`,
      amount: item?.amount || 0,
      targetId: id,
      timestamp: nowIso,
      userFullName:
        item?.userName || 'Member'
    });

    this.notifications.unshift({
      id: `notif-${Date.now()}`,
      title: 'Payment rejected',
      message: `Deposit for ${item?.userName || 'Member'} was rejected: ${reason.trim()}`,
      type: 'deposit',
      read: false,
      createdAt: nowIso,
      actionUrl: '/admin/deposits'
    });

    this.persist();

    devStore.save(db => {
      if (
        userId &&
        db.profiles[userId]
      ) {
        db.profiles[
          userId
        ].paymentProofStatus =
          'rejected';
      }

      const proof =
        db.paymentProofs.find(
          p => p.id === id
        );

      if (proof) {
        proof.status = 'rejected';
        proof.rejectionReason =
          reason.trim();
        proof.reviewedAt = nowIso;
        proof.reviewedBy =
          currentAdminId;
      }
    });

    await this.loadFromSupabase();

    return { success: true };
  }

  // ============================================================
  // WITHDRAWALS
  // ============================================================

  getWithdrawals(
    statusFilter?:
      | 'all'
      | 'pending'
      | 'approved'
      | 'rejected'
  ): WithdrawalItem[] {
    if (
      !statusFilter ||
      statusFilter === 'all'
    ) {
      return [...this.withdrawals];
    }

    return this.withdrawals.filter(
      w => w.status === statusFilter
    );
  }

  getWithdrawalById(
    id: string
  ): WithdrawalItem | undefined {
    return this.withdrawals.find(
      w => w.id === id
    );
  }

  async approveWithdrawal(
    id: string,
    transactionRef = 'MANUAL-PAYOUT',
    actorName = 'Central Admin'
  ): Promise<{
    success: boolean;
    error?: string;
  }> {
    const item =
      this.withdrawals.find(
        w => w.id === id
      );

    if (!item) {
      return {
        success: false,
        error:
          'Withdrawal request not found.'
      };
    }

    const nowIso =
      new Date().toISOString();

    const { error } =
      await supabase
        .from('withdrawals')
        .update({
          status: 'paid',
          processed_at: nowIso,
          remarks: `Ref: ${transactionRef}`
        })
        .eq('id', id);

    if (error) {
      return {
        success: false,
        error:
          error.message ||
          'Database update failed for withdrawal approval.'
      };
    }

    item.status = 'approved';
    item.processedAt = nowIso;
    item.transactionRef =
      transactionRef;

    this.activities.unshift({
      id: `act-${Date.now()}`,
      type: 'withdrawal_approved',
      title: 'Withdrawal approved',
      description: `Disbursed ${item.netAmount.toLocaleString()} PKR to ${item.userName} via ${item.withdrawalMethod} (Ref: ${transactionRef})`,
      amount: item.grossAmount,
      targetId: item.id,
      timestamp: nowIso,
      userFullName: item.userName
    });

    this.notifications.unshift({
      id: `notif-${Date.now()}`,
      title: 'Withdrawal approved',
      message: `Payout of ${item.netAmount} PKR to ${item.userName} (${item.withdrawalMethod}) confirmed.`,
      type: 'withdrawal',
      read: false,
      createdAt: nowIso,
      actionUrl:
        '/admin/withdrawals'
    });

    this.persist();

    await this.loadFromSupabase();

    return { success: true };
  }

  async rejectWithdrawal(
    id: string,
    reason: string,
    actorName = 'Central Admin'
  ): Promise<{
    success: boolean;
    error?: string;
  }> {
    const item =
      this.withdrawals.find(
        w => w.id === id
      );

    if (!item) {
      return {
        success: false,
        error:
          'Withdrawal request not found.'
      };
    }

    if (!reason.trim()) {
      return {
        success: false,
        error:
          'Please specify a rejection reason.'
      };
    }

    const nowIso =
      new Date().toISOString();

    const { error } =
      await supabase
        .from('withdrawals')
        .update({
          status: 'rejected',
          remarks: reason.trim()
        })
        .eq('id', id);

    if (error) {
      return {
        success: false,
        error:
          error.message ||
          'Database update failed for withdrawal rejection.'
      };
    }

    item.status = 'rejected';
    item.rejectionReason =
      reason.trim();

    this.activities.unshift({
      id: `act-${Date.now()}`,
      type: 'withdrawal_rejected',
      title: 'Withdrawal rejected',
      description: `Withdrawal of ${item.grossAmount.toLocaleString()} PKR rejected for ${item.userName}. Reason: ${reason.trim()}`,
      amount: item.grossAmount,
      targetId: item.id,
      timestamp: nowIso,
      userFullName: item.userName
    });

    this.notifications.unshift({
      id: `notif-${Date.now()}`,
      title: 'Withdrawal rejected',
      message: `Withdrawal request for ${item.userName} was rejected (${reason.trim()}).`,
      type: 'withdrawal',
      read: false,
      createdAt: nowIso,
      actionUrl:
        '/admin/withdrawals'
    });

    this.persist();

    await this.loadFromSupabase();

    return { success: true };
  }

  // ============================================================
  // ACTIVITIES
  // ============================================================

  getRecentActivities(): AdminActivity[] {
    return [...this.activities].slice(0, 15);
  }

  // ============================================================
  // NOTIFICATIONS
  // ============================================================

  getNotifications(): AdminNotification[] {
    return [...this.notifications];
  }

  getUnreadNotificationsCount(): number {
    return this.notifications.filter(
      n => !n.read
    ).length;
  }

  markNotificationRead(
    id: string
  ): void {
    const notification =
      this.notifications.find(
        n => n.id === id
      );

    if (notification) {
      notification.read = true;
      this.persist();
    }
  }

  markAllNotificationsRead(): void {
    this.notifications.forEach(
      notification => {
        notification.read = true;
      }
    );

    this.persist();
  }
}

export const adminPortalService =
  new AdminPortalService();
```
