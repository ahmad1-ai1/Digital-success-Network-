import {
  User,
  Profile,
  Commission,
  PointsLedger,
  Withdrawal,
  PaymentProof,
  KYCRecord,
  Spin,
  SpinPrize,
  Notification,
  Referral,
  AuditLog
} from '../types';

export function userFromProfile(p: Profile): User {
  return {
    id: p.id,
    fullName: p.fullName,
    email: p.email,
    phone: p.phone,
    role: p.role,
    referralCode: p.referralCode,
    sponsorId: p.sponsorId,
    sponsorCode: p.sponsorCode,
    accountStatus: p.accountStatus,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt
  };
}

export function profileFromDb(row: any): Profile {
  return {
    id: row.id,
    fullName: row.full_name || '',
    email: row.email || '',
    phone: row.phone || '',
    role: row.role || 'member',
    referralCode: row.referral_code || '',
    sponsorId: row.sponsor_id || null,
    sponsorCode: row.sponsor_code || null,
    accountStatus: row.account_status || 'pending_activation',
    currentRank: row.current_rank || 'Starter',
    currentPoints: Number(row.current_points) || 0,
    availableBalance: Number(row.available_balance) || 0,
    totalEarnings: Number(row.total_earnings) || 0,
    pendingWithdrawals: Number(row.pending_withdrawals) || 0,
    spinCredits: Number(row.spin_credits) || 0,
    directTeamCount: Number(row.direct_team_count) || 0,
    totalTeamCount: Number(row.total_team_count) || 0,
    kycStatus: row.kyc_status || 'not_submitted',
    paymentProofStatus:
      row.account_status === 'active' || row.payment_proof_status === 'approved' || row.payment_proof_status === 'verified'
        ? 'approved'
        : row.payment_proof_status === 'rejected'
        ? 'rejected'
        : 'pending',
    notificationPreferences: row.notification_preferences || {
      email: true,
      sms: false,
      inApp: true
    },
    languagePreference: row.language_preference || 'roman_urdu',
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function profileToDb(p: Partial<Profile>): any {
  const row: any = {};
  if (p.id !== undefined) row.id = p.id;
  if (p.fullName !== undefined) row.full_name = p.fullName;
  if (p.email !== undefined) row.email = p.email;
  if (p.phone !== undefined) row.phone = p.phone;
  if (p.role !== undefined) row.role = p.role;
  if (p.referralCode !== undefined) row.referral_code = p.referralCode;
  if (p.sponsorId !== undefined) row.sponsor_id = p.sponsorId;
  if (p.sponsorCode !== undefined) row.sponsor_code = p.sponsorCode;
  if (p.accountStatus !== undefined) row.account_status = p.accountStatus;
  if (p.currentRank !== undefined) row.current_rank = p.currentRank;
  if (p.currentPoints !== undefined) row.current_points = p.currentPoints;
  if (p.availableBalance !== undefined) row.available_balance = p.availableBalance;
  if (p.totalEarnings !== undefined) row.total_earnings = p.totalEarnings;
  if (p.pendingWithdrawals !== undefined) row.pending_withdrawals = p.pendingWithdrawals;
  if (p.spinCredits !== undefined) row.spin_credits = p.spinCredits;
  if (p.directTeamCount !== undefined) row.direct_team_count = p.directTeamCount;
  if (p.totalTeamCount !== undefined) row.total_team_count = p.totalTeamCount;
  if (p.kycStatus !== undefined) row.kyc_status = p.kycStatus;
  if (p.paymentProofStatus !== undefined) row.payment_proof_status = p.paymentProofStatus;
  if (p.notificationPreferences !== undefined) row.notification_preferences = p.notificationPreferences;
  if (p.languagePreference !== undefined) row.language_preference = p.languagePreference;
  return row;
}

export function commissionFromDb(row: any): Commission {
  return {
    id: row.id,
    userId: row.user_id,
    sourceUserId: row.source_user_id,
    sourceUserName: row.source_user_name,
    level: row.level,
    eligibleAmount: Number(row.eligible_amount) || 1300,
    rate: Number(row.rate) || 0,
    commission: Number(row.commission) || 0,
    status: row.status || 'credited',
    createdAt: row.created_at
  };
}

export function pointsFromDb(row: any): PointsLedger {
  return {
    id: row.id,
    userId: row.user_id,
    sourceUserId: row.source_user_id || undefined,
    sourceUserName: row.source_user_name || undefined,
    level: row.level || undefined,
    activity: row.activity,
    points: Number(row.points) || 0,
    createdAt: row.created_at
  };
}

export function withdrawalFromDb(row: any): Withdrawal {
  return {
    id: row.id,
    userId: row.user_id,
    userFullName: row.user_full_name,
    grossAmount: Number(row.gross_amount) || 0,
    amount: Number(row.gross_amount) || 0,
    feePercentage: Number(row.fee_percentage) || 2,
    feeAmount: Number(row.fee_amount) || 0,
    netAmount: Number(row.net_amount) || 0,
    paymentMethod: row.payment_method,
    payoutMethod: (row.payment_method?.toLowerCase() as any) || 'jazzcash',
    accountTitle: row.account_title,
    accountNumber: row.account_number,
    userNote: row.user_note || undefined,
    status: row.status,
    remarks: row.remarks || undefined,
    processedAt: row.processed_at || undefined,
    createdAt: row.created_at
  };
}

export function paymentProofFromDb(row: any): PaymentProof {
  const normalizedStatus =
    row.status === 'verified' || row.status === 'approved'
      ? 'approved'
      : row.status === 'rejected'
      ? 'rejected'
      : 'pending';

  return {
    id: row.id,
    userId: row.user_id,
    userFullName: row.user_full_name,
    userEmail: row.user_email,
    amount: Number(row.amount) || 1300,
    paymentMethod: row.payment_method,
    transactionId: row.transaction_id,
    screenshotUrl: row.screenshot_url,
    senderName: row.sender_name || undefined,
    senderAccount: row.sender_account || undefined,
    notes: row.notes || undefined,
    status: normalizedStatus as any,
    reviewedBy: row.reviewed_by || undefined,
    reviewedAt: row.reviewed_at || undefined,
    rejectionReason: row.rejection_reason || undefined,
    dateSubmitted: row.date_submitted || row.created_at,
    createdAt: row.date_submitted || row.created_at
  };
}

export function kycFromDb(row: any): KYCRecord {
  return {
    id: row.id,
    userId: row.user_id,
    cnicNumber: row.cnic_number,
    fullName: row.full_name || undefined,
    dateOfBirth: row.date_of_birth || undefined,
    cnicFrontUrl: row.cnic_front_url,
    cnicBackUrl: row.cnic_back_url,
    selfieUrl: row.selfie_url,
    status: row.status,
    rejectionReason: row.rejection_reason || undefined,
    submittedAt: row.submitted_at || row.created_at,
    reviewedAt: row.reviewed_at || undefined
  };
}

export function spinFromDb(row: any): Spin {
  return {
    id: row.id,
    userId: row.user_id,
    prizeId: row.prize_id,
    prizeName: row.prize_name,
    prizeType: row.prize_type,
    prizeValue: Number(row.prize_value) || 0,
    rewardValue: Number(row.prize_value) || 0,
    createdAt: row.created_at
  };
}

export function notificationFromDb(row: any): Notification {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    message: row.message,
    type: row.type,
    read: !!row.read,
    createdAt: row.created_at
  };
}

export function referralFromDb(row: any): Referral {
  return {
    id: row.id,
    referrerId: row.referrer_id,
    referredUserId: row.referred_user_id,
    level: row.level,
    status: row.status,
    registeredAt: row.registered_at,
    activatedAt: row.activated_at || null
  };
}

export function auditLogFromDb(row: any): AuditLog {
  return {
    id: row.id,
    actorId: row.actor_id,
    actorName: row.actor_name,
    action: row.action,
    entity: row.entity,
    entityId: row.entity_id,
    previousValue: row.previous_value,
    newValue: row.new_value,
    timestamp: row.timestamp || row.created_at
  };
}

export function spinPrizeFromDb(row: any): SpinPrize {
  return {
    id: String(row.id),
    name: row.name,
    label: row.label || row.name,
    type: (row.type as 'points' | 'cash' | 'spins' | 'none') || 'points',
    value: Number(row.value) || 0,
    weight: Number(row.weight) || 10,
    color: row.color || '#3B82F6',
    active: row.active ?? true
  };
}
