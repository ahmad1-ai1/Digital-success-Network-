import { supabase } from '../lib/supabase';
import { devStore } from '../store/devStore';
import {
  User,
  Profile,
  PaymentProof,
  KYCRecord,
  Withdrawal,
  AuditLog,
  Commission,
  PointsLedger,
  SpinPrize,
  CommissionRateConfig,
  WithdrawalStatus,
  AccountStatus
} from '../types';
import { rankService } from './rankService';

export const adminService = {
  /**
   * Verify if current caller or passed actorId has authorized admin privileges
   */
  checkAdminAccess(actorId?: string): boolean {
    const db = devStore.getData();
    const callerId = actorId || db.currentUserId;
    if (!callerId) return false;
    const caller = db.users.find(u => u.id === callerId);
    return caller?.role === 'admin';
  },

  getMembers(): { users: User[]; profiles: Record<string, Profile> } {
    if (!this.checkAdminAccess()) {
      return { users: [], profiles: {} };
    }
    const db = devStore.getData();
    return {
      users: db.users,
      profiles: db.profiles
    };
  },

  getUsers(): User[] {
    if (!this.checkAdminAccess()) {
      return [];
    }
    return devStore.getData().users;
  },

  updateUserStatus(
    userId: string,
    status: AccountStatus,
    actorId = 'usr-admin-01'
  ): { success: boolean; error?: string } {
    if (!this.checkAdminAccess(actorId)) {
      return { success: false, error: 'Unauthorized: Only an authorized admin can perform this action.' };
    }
    if (status === 'active') {
      const ok = this.activateMember(userId, actorId);
      return { success: ok };
    } else if (status === 'suspended') {
      const ok = this.suspendMember(userId, actorId);
      return { success: ok };
    } else if (status === 'rejected') {
      const ok = this.rejectMember(userId, actorId);
      return { success: ok };
    } else {
      let ok = false;
      devStore.save(data => {
        const u = data.users.find(item => item.id === userId);
        const p = data.profiles[userId];
        if (u && p) {
          u.accountStatus = status;
          p.accountStatus = status;
          ok = true;
        }
      });
      return { success: ok };
    }
  },

  getPendingPayments() {
    if (!this.checkAdminAccess()) {
      return [];
    }
    return devStore.getData().paymentProofs.filter(p => p.status === 'pending');
  },

  getPendingWithdrawals() {
    if (!this.checkAdminAccess()) {
      return [];
    }
    return devStore.getData().withdrawals.filter(w => w.status === 'pending');
  },

  getPendingKYC() {
    if (!this.checkAdminAccess()) {
      return [];
    }
    return devStore.getData().kycRecords.filter(k => k.status === 'pending');
  },

  getStats(): {
    totalUsers: number;
    activeUsers: number;
    pendingUsers: number;
    pendingPayments: number;
    pendingWithdrawals: number;
    totalCommissionsPaid: number;
  } {
    if (!this.checkAdminAccess()) {
      return {
        totalUsers: 0,
        activeUsers: 0,
        pendingUsers: 0,
        pendingPayments: 0,
        pendingWithdrawals: 0,
        totalCommissionsPaid: 0
      };
    }
    const db = devStore.getData();
    const totalUsers = db.users.length;
    const activeUsers = db.users.filter(u => u.accountStatus === 'active').length;
    const pendingUsers = db.users.filter(
      u => u.accountStatus === 'pending_activation' || u.accountStatus === 'pending_verification'
    ).length;
    const pendingPayments = db.paymentProofs.filter(p => p.status === 'pending').length;
    const pendingWithdrawals = db.withdrawals.filter(
      w => w.status === 'pending' || w.status === 'processing'
    ).length;
    const totalCommissionsPaid = db.commissions
      .filter(c => c.status === 'credited')
      .reduce((sum, c) => sum + c.commission, 0);

    return {
      totalUsers,
      activeUsers,
      pendingUsers,
      pendingPayments,
      pendingWithdrawals,
      totalCommissionsPaid
    };
  },

  activateMember(userId: string, actorId = 'usr-admin-01'): boolean {
    let success = false;
    devStore.save(data => {
      const user = data.users.find(u => u.id === userId);
      const profile = data.profiles[userId];
      if (user && profile) {
        const prev = user.accountStatus;
        user.accountStatus = 'active';
        profile.accountStatus = 'active';
        user.updatedAt = new Date().toISOString();

        data.auditLogs.unshift({
          id: `audit-${Date.now()}`,
          actorId,
          actorName: 'Central Admin',
          action: 'ACTIVATE_MEMBER',
          entity: 'User',
          entityId: userId,
          previousValue: `status: ${prev}`,
          newValue: 'status: active',
          timestamp: new Date().toISOString()
        });

        data.notifications.push({
          id: `notif-${Date.now()}`,
          userId,
          title: 'Account Activated',
          message: 'Your account has been activated by Central Administration. Welcome to DSN!',
          type: 'account_activated',
          read: false,
          createdAt: new Date().toISOString()
        });

        success = true;
      }
    });
    return success;
  },

  suspendMember(userId: string, actorId = 'usr-admin-01'): boolean {
    let success = false;
    devStore.save(data => {
      const user = data.users.find(u => u.id === userId);
      const profile = data.profiles[userId];
      if (user && profile) {
        const prev = user.accountStatus;
        user.accountStatus = 'suspended';
        profile.accountStatus = 'suspended';
        user.updatedAt = new Date().toISOString();

        data.auditLogs.unshift({
          id: `audit-${Date.now()}`,
          actorId,
          actorName: 'Central Admin',
          action: 'SUSPEND_MEMBER',
          entity: 'User',
          entityId: userId,
          previousValue: `status: ${prev}`,
          newValue: 'status: suspended',
          timestamp: new Date().toISOString()
        });

        success = true;
      }
    });
    return success;
  },

  rejectMember(userId: string, actorId = 'usr-admin-01'): boolean {
    let success = false;
    devStore.save(data => {
      const user = data.users.find(u => u.id === userId);
      const profile = data.profiles[userId];
      if (user && profile) {
        const prev = user.accountStatus;
        user.accountStatus = 'rejected';
        profile.accountStatus = 'rejected';
        user.updatedAt = new Date().toISOString();

        data.auditLogs.unshift({
          id: `audit-${Date.now()}`,
          actorId,
          actorName: 'Central Admin',
          action: 'REJECT_MEMBER',
          entity: 'User',
          entityId: userId,
          previousValue: `status: ${prev}`,
          newValue: 'status: rejected',
          timestamp: new Date().toISOString()
        });

        success = true;
      }
    });
    return success;
  },

  /**
   * ATOMIC PAYMENT APPROVAL WORKFLOW
   * 1. Approves payment proof
   * 2. Sets user status to 'active'
   * 3. Calculates & credits multi-level commissions (L1 20%, L2 10%, L3 5%, L4 3%)
   * 4. Calculates & credits points (50 direct, 25 indirect)
   * 5. Direct sponsor receives 1 spin credit
   * 6. Recalculates rank for all upline members
   * 7. Generates notifications
   * 8. Writes audit log
   */
  approvePayment(proofId: string, actorId = 'usr-admin-01'): { success: boolean; error?: string } {
    if (!this.checkAdminAccess(actorId)) {
      return { success: false, error: 'Unauthorized: Only an authorized admin can perform this action.' };
    }

    let result: { success: boolean; error?: string } = { success: false };

    devStore.save(data => {
      const proof = data.paymentProofs.find(p => p.id === proofId);
      if (!proof) {
        result = { success: false, error: 'Payment proof not found.' };
        return;
      }

      if (proof.status === 'approved') {
        result = { success: false, error: 'Payment proof is already approved.' };
        return;
      }

      const user = data.users.find(u => u.id === proof.userId);
      const profile = data.profiles[proof.userId];
      if (!user || !profile) {
        result = { success: false, error: 'Target user not found.' };
        return;
      }

      // 1. Mark proof approved
      proof.status = 'approved';
      proof.reviewedBy = actorId;
      proof.reviewedAt = new Date().toISOString();
      profile.paymentProofStatus = 'approved';

      // 2. Activate member
      user.accountStatus = 'active';
      profile.accountStatus = 'active';
      user.updatedAt = new Date().toISOString();

      const baseAmount = proof.amount > 0 ? proof.amount : data.settings.activationFeePKR;
      const rates = data.settings.commissionRates;
      const directPoints = data.settings.directJoiningPoints; // 50
      const indirectPoints = data.settings.indirectJoiningPoints; // 25

      // 3. Trace upline sponsors (Levels 1 to 4)
      const upline: Array<{ userId: string; level: 1 | 2 | 3 | 4 }> = [];
      let currentSponsorId = user.sponsorId;
      let currentLevel = 1;

      while (currentSponsorId && currentLevel <= 4) {
        const sp = data.users.find(u => u.id === currentSponsorId);
        if (sp) {
          upline.push({ userId: sp.id, level: currentLevel as 1 | 2 | 3 | 4 });
          currentSponsorId = sp.sponsorId;
          currentLevel++;
        } else {
          break;
        }
      }

      // 4. Distribute commission, points & spin credit up the chain
      for (const node of upline) {
        const sponsorProfile = data.profiles[node.userId];
        if (!sponsorProfile) continue;

        let rate = 0;
        let pointsToAward = 0;

        if (node.level === 1) {
          rate = rates.level1; // 20%
          pointsToAward = directPoints; // 50 points
          // Direct sponsor receives 1 Lucky Spin Credit
          sponsorProfile.spinCredits += 1;

          data.notifications.push({
            id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 4)}`,
            userId: node.userId,
            title: 'Lucky Spin Awarded!',
            message: `You received 1 spin credit because your direct member ${user.fullName} activated their account!`,
            type: 'spin_available',
            read: false,
            createdAt: new Date().toISOString()
          });
        } else if (node.level === 2) {
          rate = rates.level2; // 10%
          pointsToAward = indirectPoints; // 25 points
        } else if (node.level === 3) {
          rate = rates.level3; // 5%
          pointsToAward = indirectPoints; // 25 points
        } else if (node.level === 4) {
          rate = rates.level4; // 3%
          pointsToAward = indirectPoints; // 25 points
        }

        const commAmount = Math.round(baseAmount * rate);

        // Credit commission
        if (commAmount > 0) {
          const commRecord: Commission = {
            id: `comm-${Date.now()}-${node.level}`,
            userId: node.userId,
            sourceUserId: user.id,
            sourceUserName: user.fullName,
            level: node.level,
            eligibleAmount: baseAmount,
            rate,
            commission: commAmount,
            status: 'credited',
            createdAt: new Date().toISOString()
          };
          data.commissions.unshift(commRecord);

          sponsorProfile.availableBalance += commAmount;
          sponsorProfile.totalEarnings += commAmount;

          data.notifications.push({
            id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 4)}`,
            userId: node.userId,
            title: `Level ${node.level} Commission Credited`,
            message: `You earned ${commAmount} PKR (${Math.round(rate * 100)}%) from ${user.fullName}'s verified activation.`,
            type: 'commission_received',
            read: false,
            createdAt: new Date().toISOString()
          });
        }

        // Credit points ledger
        if (pointsToAward > 0) {
          const ptsRecord: PointsLedger = {
            id: `pts-${Date.now()}-${node.level}`,
            userId: node.userId,
            sourceUserId: user.id,
            sourceUserName: user.fullName,
            level: node.level,
            activity: node.level === 1 ? 'Direct Member Activation (L1)' : `Indirect Team Activation (L${node.level})`,
            points: pointsToAward,
            createdAt: new Date().toISOString()
          };
          data.pointsLedger.unshift(ptsRecord);
          sponsorProfile.currentPoints += pointsToAward;

          data.notifications.push({
            id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 4)}`,
            userId: node.userId,
            title: 'Points Credited',
            message: `+${pointsToAward} points added to your ledger from ${user.fullName} activation.`,
            type: 'points_received',
            read: false,
            createdAt: new Date().toISOString()
          });

          // Recalculate rank for sponsor
          const newRank = rankService.calculateRank(sponsorProfile.currentPoints);
          if (newRank !== sponsorProfile.currentRank) {
            sponsorProfile.currentRank = newRank;
            data.notifications.push({
              id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 4)}`,
              userId: node.userId,
              title: 'Rank Upgrade!',
              message: `Congratulations! You have reached ${newRank} rank with ${sponsorProfile.currentPoints} total points.`,
              type: 'rank_achieved',
              read: false,
              createdAt: new Date().toISOString()
            });
          }
        }
      }

      // Notify the activated member
      data.notifications.push({
        id: `notif-${Date.now()}`,
        userId: user.id,
        title: 'Account Activated Successfully!',
        message: 'Your payment proof has been approved. Your DSN account is now Active. You can now build your team, earn commissions, and climb ranks!',
        type: 'payment_proof_approved',
        read: false,
        createdAt: new Date().toISOString()
      });

      // Audit Log
      data.auditLogs.unshift({
        id: `audit-${Date.now()}`,
        actorId,
        actorName: 'Central Admin',
        action: 'APPROVE_PAYMENT_AND_ACTIVATE',
        entity: 'PaymentProof',
        entityId: proofId,
        previousValue: 'status: pending',
        newValue: `status: approved, activated: ${user.id} (${user.fullName}), distributed commissions to ${upline.length} uplines`,
        timestamp: new Date().toISOString()
      });

      result = { success: true };
    });

    if (result.success) {
      (async () => {
        try {
          await supabase.rpc('admin_approve_payment', {
            p_proof_id: proofId,
            p_actor_id: actorId
          });
        } catch (err) {
          console.warn('Supabase admin_approve_payment call error:', err);
        }
      })();
    }

    return result;
  },

  rejectPayment(
    proofId: string,
    arg2?: string,
    arg3?: string
  ): { success: boolean; error?: string } {
    let reason = 'Invalid transaction details';
    let actorId = 'usr-admin-01';

    if (arg3 !== undefined) {
      actorId = arg2 || 'usr-admin-01';
      reason = arg3 || reason;
    } else if (arg2 !== undefined) {
      reason = arg2;
    }

    if (!this.checkAdminAccess(actorId)) {
      return { success: false, error: 'Unauthorized: Only an authorized admin can perform this action.' };
    }

    let success = false;
    devStore.save(data => {
      const proof = data.paymentProofs.find(p => p.id === proofId);
      if (proof) {
        proof.status = 'rejected';
        proof.rejectionReason = reason;
        proof.reviewedBy = actorId;
        proof.reviewedAt = new Date().toISOString();

        if (data.profiles[proof.userId]) {
          data.profiles[proof.userId].paymentProofStatus = 'rejected';
        }

        data.notifications.push({
          id: `notif-${Date.now()}`,
          userId: proof.userId,
          title: 'Payment Proof Rejected',
          message: `Your payment proof was rejected. Reason: ${reason || 'Invalid transaction details'}. Please submit a valid receipt.`,
          type: 'payment_proof_rejected',
          read: false,
          createdAt: new Date().toISOString()
        });

        data.auditLogs.unshift({
          id: `audit-${Date.now()}`,
          actorId,
          actorName: 'Central Admin',
          action: 'REJECT_PAYMENT',
          entity: 'PaymentProof',
          entityId: proofId,
          previousValue: 'status: pending',
          newValue: `status: rejected, reason: ${reason}`,
          timestamp: new Date().toISOString()
        });

        success = true;
      }
    });

    if (success) {
      (async () => {
        try {
          await supabase
            .from('payment_proofs')
            .update({
              status: 'rejected',
              rejection_reason: reason,
              reviewed_by: actorId,
              reviewed_at: new Date().toISOString()
            })
            .eq('id', proofId);
        } catch (err) {
          console.warn('Supabase reject payment sync error:', err);
        }
      })();
    }

    return { success, error: success ? undefined : 'Payment proof not found' };
  },

  approveKYC(kycId: string, actorId = 'usr-admin-01'): { success: boolean; error?: string } {
    if (!this.checkAdminAccess(actorId)) {
      return { success: false, error: 'Unauthorized: Only an authorized admin can perform this action.' };
    }

    let success = false;
    devStore.save(data => {
      const record = data.kycRecords.find(k => k.id === kycId);
      if (record) {
        record.status = 'approved';
        record.reviewedAt = new Date().toISOString();

        if (data.profiles[record.userId]) {
          data.profiles[record.userId].kycStatus = 'approved';
        }

        data.notifications.push({
          id: `notif-${Date.now()}`,
          userId: record.userId,
          title: 'KYC Verified',
          message: 'Your CNIC identity verification has been approved by Central Administration.',
          type: 'account_activated',
          read: false,
          createdAt: new Date().toISOString()
        });

        data.auditLogs.unshift({
          id: `audit-${Date.now()}`,
          actorId,
          actorName: 'Central Admin',
          action: 'APPROVE_KYC',
          entity: 'KYCRecord',
          entityId: kycId,
          previousValue: 'status: pending',
          newValue: 'status: approved',
          timestamp: new Date().toISOString()
        });

        success = true;
      }
    });

    if (success) {
      (async () => {
        try {
          await supabase
            .from('kyc_records')
            .update({
              status: 'approved',
              reviewed_at: new Date().toISOString()
            })
            .eq('id', kycId);
        } catch (err) {
          console.warn('Supabase approve KYC sync error:', err);
        }
      })();
    }

    return { success, error: success ? undefined : 'KYC record not found' };
  },

  rejectKYC(
    kycId: string,
    arg2?: string,
    arg3?: string
  ): { success: boolean; error?: string } {
    let reason = 'Documents unclear';
    let actorId = 'usr-admin-01';

    if (arg3 !== undefined) {
      actorId = arg2 || 'usr-admin-01';
      reason = arg3 || reason;
    } else if (arg2 !== undefined) {
      reason = arg2;
    }

    if (!this.checkAdminAccess(actorId)) {
      return { success: false, error: 'Unauthorized: Only an authorized admin can perform this action.' };
    }

    let success = false;
    devStore.save(data => {
      const record = data.kycRecords.find(k => k.id === kycId);
      if (record) {
        record.status = 'rejected';
        record.reviewerNotes = reason;
        record.reviewedAt = new Date().toISOString();

        if (data.profiles[record.userId]) {
          data.profiles[record.userId].kycStatus = 'rejected';
        }

        data.notifications.push({
          id: `notif-${Date.now()}`,
          userId: record.userId,
          title: 'KYC Verification Needs Correction',
          message: `Your identity verification could not be approved: ${reason}. Please re-submit clear documents.`,
          type: 'account_activated',
          read: false,
          createdAt: new Date().toISOString()
        });

        data.auditLogs.unshift({
          id: `audit-${Date.now()}`,
          actorId,
          actorName: 'Central Admin',
          action: 'REJECT_KYC',
          entity: 'KYCRecord',
          entityId: kycId,
          previousValue: 'status: pending',
          newValue: `status: rejected, reason: ${reason}`,
          timestamp: new Date().toISOString()
        });

        success = true;
      }
    });

    if (success) {
      (async () => {
        try {
          await supabase
            .from('kyc_records')
            .update({
              status: 'rejected',
              reviewer_notes: reason,
              reviewed_at: new Date().toISOString()
            })
            .eq('id', kycId);
        } catch (err) {
          console.warn('Supabase reject KYC sync error:', err);
        }
      })();
    }

    return { success, error: success ? undefined : 'KYC record not found' };
  },

  processWithdrawal(
    withdrawalId: string,
    status: WithdrawalStatus,
    actorId = 'usr-admin-01',
    remarks = ''
  ): { success: boolean; error?: string } {
    const ok = this.updateWithdrawal(withdrawalId, status, remarks, actorId);
    return { success: ok, error: ok ? undefined : 'Failed to update withdrawal status' };
  },

  rejectWithdrawal(
    withdrawalId: string,
    actorIdOrReason?: string,
    reasonOrActor?: string
  ): { success: boolean; error?: string } {
    let reason = 'Administrative decision';
    let actorId = 'usr-admin-01';

    if (reasonOrActor !== undefined) {
      actorId = actorIdOrReason || 'usr-admin-01';
      reason = reasonOrActor || reason;
    } else if (actorIdOrReason !== undefined) {
      reason = actorIdOrReason;
    }

    const ok = this.updateWithdrawal(withdrawalId, 'rejected', reason, actorId);
    return { success: ok, error: ok ? undefined : 'Failed to reject withdrawal' };
  },

  updateWithdrawal(
    withdrawalId: string,
    status: WithdrawalStatus,
    remarks = '',
    actorId = 'usr-admin-01'
  ): boolean {
    if (!this.checkAdminAccess(actorId)) {
      return false;
    }

    let success = false;
    devStore.save(data => {
      const w = data.withdrawals.find(item => item.id === withdrawalId);
      if (!w) return;

      const prevStatus = w.status;
      w.status = status;
      w.remarks = remarks;
      if (status === 'paid') {
        w.processedAt = new Date().toISOString();
      }

      const profile = data.profiles[w.userId];

      // If rejected or cancelled, refund the grossAmount back to member's available balance!
      if ((status === 'rejected' || status === 'cancelled') && prevStatus !== 'rejected' && prevStatus !== 'cancelled') {
        if (profile) {
          profile.availableBalance += w.grossAmount;
          profile.pendingWithdrawals = Math.max(0, profile.pendingWithdrawals - w.grossAmount);
        }
      } else if (status === 'paid' && prevStatus !== 'paid') {
        if (profile) {
          profile.pendingWithdrawals = Math.max(0, profile.pendingWithdrawals - w.grossAmount);
        }
      }

      data.notifications.push({
        id: `notif-${Date.now()}`,
        userId: w.userId,
        title: `Withdrawal ${status.toUpperCase()}`,
        message: `Your withdrawal request ${w.id} of ${w.grossAmount} PKR has been updated to: ${status}. ${remarks ? 'Note: ' + remarks : ''}`,
        type: 'withdrawal_status_changed',
        read: false,
        createdAt: new Date().toISOString()
      });

      data.auditLogs.unshift({
        id: `audit-${Date.now()}`,
        actorId,
        actorName: 'Central Admin',
        action: 'UPDATE_WITHDRAWAL_STATUS',
        entity: 'Withdrawal',
        entityId: withdrawalId,
        previousValue: `status: ${prevStatus}`,
        newValue: `status: ${status}, remarks: ${remarks}`,
        timestamp: new Date().toISOString()
      });

      success = true;
    });
    return success;
  },

  updateCommissionRates(rates: CommissionRateConfig, actorId = 'usr-admin-01'): void {
    if (!this.checkAdminAccess(actorId)) return;
    devStore.save(data => {
      const prev = JSON.stringify(data.settings.commissionRates);
      data.settings.commissionRates = rates;
      data.auditLogs.unshift({
        id: `audit-${Date.now()}`,
        actorId,
        actorName: 'Central Admin',
        action: 'UPDATE_COMMISSION_RATES',
        entity: 'BusinessSettings',
        entityId: 'commission_rates',
        previousValue: prev,
        newValue: JSON.stringify(rates),
        timestamp: new Date().toISOString()
      });
    });
  },

  updateRankThresholds(
    thresholds: Record<string, number>,
    actorId = 'usr-admin-01'
  ): void {
    if (!this.checkAdminAccess(actorId)) return;
    devStore.save(data => {
      const prev = JSON.stringify(data.settings.rankThresholds);
      data.settings.rankThresholds = thresholds as any;
      data.auditLogs.unshift({
        id: `audit-${Date.now()}`,
        actorId,
        actorName: 'Central Admin',
        action: 'UPDATE_RANK_THRESHOLDS',
        entity: 'BusinessSettings',
        entityId: 'rank_thresholds',
        previousValue: prev,
        newValue: JSON.stringify(thresholds),
        timestamp: new Date().toISOString()
      });
    });
  },

  addSpinPrize(prize: Omit<SpinPrize, 'id'>, actorId = 'usr-admin-01'): SpinPrize | null {
    if (!this.checkAdminAccess(actorId)) return null;
    const newPrize: SpinPrize = {
      ...prize,
      id: `prize-${Date.now()}`
    };
    devStore.save(data => {
      data.spinPrizes.push(newPrize);
      data.auditLogs.unshift({
        id: `audit-${Date.now()}`,
        actorId,
        actorName: 'Central Admin',
        action: 'ADD_SPIN_PRIZE',
        entity: 'SpinPrize',
        entityId: newPrize.id,
        previousValue: 'none',
        newValue: JSON.stringify(newPrize),
        timestamp: new Date().toISOString()
      });
    });
    return newPrize;
  },

  updateSpinPrize(id: string, updates: Partial<SpinPrize>, actorId = 'usr-admin-01'): void {
    if (!this.checkAdminAccess(actorId)) return;
    devStore.save(data => {
      const p = data.spinPrizes.find(item => item.id === id);
      if (p) {
        const prev = JSON.stringify(p);
        Object.assign(p, updates);
        data.auditLogs.unshift({
          id: `audit-${Date.now()}`,
          actorId,
          actorName: 'Central Admin',
          action: 'UPDATE_SPIN_PRIZE',
          entity: 'SpinPrize',
          entityId: id,
          previousValue: prev,
          newValue: JSON.stringify(p),
          timestamp: new Date().toISOString()
        });
      }
    });

    (async () => {
      try {
        const payload: Record<string, any> = {};
        if (updates.name !== undefined) payload.name = updates.name;
        if (updates.label !== undefined) payload.label = updates.label;
        if (updates.type !== undefined) payload.type = updates.type;
        if (updates.value !== undefined) payload.value = updates.value;
        if (updates.weight !== undefined) payload.weight = updates.weight;
        if (updates.color !== undefined) payload.color = updates.color;
        if (updates.active !== undefined) payload.active = updates.active;
        if (Object.keys(payload).length > 0) {
          await supabase.from('spin_prizes').update(payload).eq('id', id);
        }
      } catch (err) {
        console.warn('Supabase update spin prize error:', err);
      }
    })();
  },

  sendBroadcastNotification(title: string, message: string, actorId = 'usr-admin-01'): void {
    if (!this.checkAdminAccess(actorId)) return;
    devStore.save(data => {
      for (const u of data.users) {
        data.notifications.unshift({
          id: `notif-${Date.now()}-${u.id.slice(-4)}`,
          userId: u.id,
          title,
          message,
          type: 'system_announcement',
          read: false,
          createdAt: new Date().toISOString()
        });
      }

      data.auditLogs.unshift({
        id: `audit-${Date.now()}`,
        actorId,
        actorName: 'Central Admin',
        action: 'BROADCAST_NOTIFICATION',
        entity: 'Notification',
        entityId: 'all_users',
        previousValue: 'none',
        newValue: `title: ${title}, recipients: ${data.users.length}`,
        timestamp: new Date().toISOString()
      });
    });
  },

  sendIndividualNotification(userId: string, title: string, message: string, actorId = 'usr-admin-01'): void {
    devStore.save(data => {
      data.notifications.unshift({
        id: `notif-${Date.now()}`,
        userId,
        title,
        message,
        type: 'system_announcement',
        read: false,
        createdAt: new Date().toISOString()
      });

      data.auditLogs.unshift({
        id: `audit-${Date.now()}`,
        actorId,
        actorName: 'Central Admin',
        action: 'DIRECT_NOTIFICATION',
        entity: 'Notification',
        entityId: userId,
        previousValue: 'none',
        newValue: `title: ${title}`,
        timestamp: new Date().toISOString()
      });
    });
  },

  getReports(): {
    memberGrowth: { active: number; pending: number; suspended: number; total: number };
    financialSummary: { totalCommissionsPaid: number; totalWithdrawalsPaid: number; pendingWithdrawals: number };
    pointsSummary: { totalPointsIssued: number; totalLedgerCount: number };
    ranksDistribution: Record<string, number>;
  } {
    const db = devStore.getData();
    let active = 0, pending = 0, suspended = 0;
    const ranksDistribution: Record<string, number> = {
      Starter: 0,
      Silver: 0,
      Gold: 0,
      Platinum: 0,
      Diamond: 0,
      Crown: 0
    };

    for (const u of db.users) {
      if (u.accountStatus === 'active') active++;
      else if (u.accountStatus === 'pending_activation' || u.accountStatus === 'pending_verification') pending++;
      else if (u.accountStatus === 'suspended') suspended++;

      const p = db.profiles[u.id];
      if (p && ranksDistribution[p.currentRank] !== undefined) {
        ranksDistribution[p.currentRank]++;
      }
    }

    const totalCommissionsPaid = db.commissions
      .filter(c => c.status === 'credited')
      .reduce((sum, c) => sum + c.commission, 0);

    const totalWithdrawalsPaid = db.withdrawals
      .filter(w => w.status === 'paid')
      .reduce((sum, w) => sum + w.netAmount, 0);

    const pendingWithdrawals = db.withdrawals
      .filter(w => w.status === 'pending' || w.status === 'processing')
      .reduce((sum, w) => sum + w.grossAmount, 0);

    const totalPointsIssued = db.pointsLedger.reduce((sum, p) => sum + p.points, 0);

    return {
      memberGrowth: { active, pending, suspended, total: db.users.length },
      financialSummary: { totalCommissionsPaid, totalWithdrawalsPaid, pendingWithdrawals },
      pointsSummary: { totalPointsIssued, totalLedgerCount: db.pointsLedger.length },
      ranksDistribution
    };
  },

  getAuditLogs(): AuditLog[] {
    return [...devStore.getData().auditLogs].sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }
};
