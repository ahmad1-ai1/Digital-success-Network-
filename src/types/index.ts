export type Language = 'roman_urdu' | 'en';

export type AccountStatus = 
  | 'pending_verification' 
  | 'pending_activation' 
  | 'active' 
  | 'suspended' 
  | 'rejected';

export type UserRole = 'member' | 'admin';

export type PaymentMethod = 'JazzCash' | 'EasyPaisa' | 'Bank Transfer';

export type PayoutMethod = 
  | 'JazzCash' 
  | 'EasyPaisa' 
  | 'Bank Transfer' 
  | 'jazzcash' 
  | 'easypaisa' 
  | 'bank_transfer'
  | PaymentMethod;

export type PaymentProofStatus = 'pending' | 'approved' | 'rejected';

export type KYCStatus = 'not_submitted' | 'pending' | 'approved' | 'rejected';

export type WithdrawalStatus = 
  | 'pending' 
  | 'approved' 
  | 'processing' 
  | 'paid' 
  | 'rejected' 
  | 'cancelled';

export type RankName = 'Starter' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Crown';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  referralCode: string;
  sponsorId: string | null;
  sponsorCode: string | null;
  accountStatus: AccountStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Profile extends User {
  currentRank: RankName;
  currentPoints: number;
  availableBalance: number;
  totalEarnings: number;
  pendingWithdrawals: number;
  spinCredits: number;
  directTeamCount: number;
  totalTeamCount: number;
  kycStatus: KYCStatus;
  paymentProofStatus: PaymentProofStatus;
  notificationPreferences?: {
    email: boolean;
    sms: boolean;
    inApp: boolean;
  };
  languagePreference?: Language;
}

export interface Referral {
  id: string;
  referrerId: string;
  referredUserId: string;
  level: 1 | 2 | 3 | 4;
  registeredAt: string;
  activatedAt: string | null;
  status: AccountStatus;
}

export interface ReferralClick {
  id: string;
  referralCode: string;
  referrerId: string;
  ipPlaceholder?: string;
  device?: string;
  createdAt: string;
  converted: boolean;
}

export interface PaymentProof {
  id: string;
  userId: string;
  userFullName: string;
  userEmail: string;
  amount: number;
  paymentMethod: PaymentMethod;
  transactionId: string;
  screenshotUrl: string;
  receiptUrl?: string;
  senderName?: string;
  senderAccount?: string;
  notes?: string;
  dateSubmitted: string;
  createdAt?: string;
  status: PaymentProofStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

export interface KYCRecord {
  id: string;
  userId: string;
  fullName?: string;
  cnicNumber: string;
  dateOfBirth?: string;
  cnicFrontUrl: string;
  cnicBackUrl: string;
  frontDocumentUrl?: string;
  backDocumentUrl?: string;
  selfieUrl: string;
  submittedAt: string;
  status: KYCStatus;
  reviewedAt?: string;
  reviewerNotes?: string;
  rejectionReason?: string;
}

export interface PointsLedger {
  id: string;
  userId: string;
  sourceUserId: string | null;
  sourceUserName?: string;
  level: number;
  activity: string;
  points: number;
  createdAt: string;
}

export interface Commission {
  id: string;
  userId: string;
  sourceUserId: string;
  sourceUserName: string;
  level: 1 | 2 | 3 | 4;
  eligibleAmount: number;
  rate: number; // e.g. 0.20 for 20%
  commission: number; // PKR
  status: 'pending' | 'credited' | 'cancelled';
  createdAt: string;
}

export interface Rank {
  name: RankName;
  threshold: number;
  color: string;
  description: string;
}

export interface RankHistory {
  id: string;
  userId: string;
  previousRank: RankName;
  newRank: RankName;
  achievedAt: string;
  pointsAtAchieved: number;
}

export interface SpinPrize {
  id: string;
  name: string;
  type: 'points' | 'cash' | 'spins' | 'none';
  value: number;
  label: string;
  weight: number; // Probability weight
  color: string;
  active: boolean;
}

export interface Spin {
  id: string;
  userId: string;
  prizeId: string;
  prizeName: string;
  prizeLabel?: string;
  prizeType: 'points' | 'cash' | 'spins' | 'none';
  prizeValue: number;
  rewardValue?: number;
  createdAt: string;
}

export interface Withdrawal {
  id: string;
  userId: string;
  userFullName: string;
  grossAmount: number;
  amount?: number;
  feePercentage: number;
  feeAmount: number;
  netAmount: number;
  paymentMethod: PaymentMethod;
  payoutMethod?: string;
  accountTitle: string;
  accountNumber: string;
  userNote?: string;
  status: WithdrawalStatus;
  createdAt: string;
  processedAt?: string;
  remarks?: string;
}

export type WithdrawalRequest = Withdrawal;

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 
    | 'account_activated' 
    | 'payment_proof_approved' 
    | 'payment_proof_rejected' 
    | 'new_team_member' 
    | 'commission_received' 
    | 'points_received' 
    | 'rank_achieved' 
    | 'spin_available' 
    | 'withdrawal_status_changed' 
    | 'system_announcement';
  read: boolean;
  createdAt: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  iconName: string;
  criteria: string;
}

export interface UserBadge {
  id: string;
  userId: string;
  badgeId: string;
  awardedAt: string;
}

export interface Product {
  id: string;
  name?: string;
  title?: string;
  slug?: string;
  description: string;
  image?: string;
  imageUrl?: string;
  category: string;
  price: number;
  currency?: string;
  status?: 'active' | 'coming_soon' | 'inactive';
  isActive?: boolean;
  level?: 'beginner' | 'intermediate' | 'advanced' | string;
  modulesCount?: number;
  durationHours?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface SupportTicket {
  id: string;
  userId?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  category: 'general' | 'activation' | 'withdrawal' | 'kyc' | 'technical';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdAt: string;
  response?: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  action: string;
  entity: string;
  entityId: string;
  previousValue: string;
  newValue: string;
  timestamp: string;
}

export interface CommissionRateConfig {
  level1: number; // default 0.20 (20%)
  level2: number; // default 0.10 (10%)
  level3: number; // default 0.05 (5%)
  level4: number; // default 0.03 (3%)
}

export interface BusinessSettings {
  activationFeePKR: number; // default 1300 PKR eligible base
  registrationFee?: number;
  commissionRates: CommissionRateConfig;
  directJoiningPoints: number; // 50 points
  indirectJoiningPoints: number; // 25 points
  pointsConfig?: {
    directActivationPoints: number;
    indirectActivationPoints: number;
  };
  rankThresholds: {
    Starter: number; // 500
    Silver: number; // 1500
    Gold: number; // 3000
    Platinum: number; // 5000
    Diamond: number; // 8000
    Crown: number; // 10000
  };
  withdrawalMinPKR: number; // 20 PKR
  withdrawalFeeRate: number; // 0.02 (2%)
  withdrawalConfig?: {
    minAmount: number;
    feeRate: number;
  };
  supportEmail: string;
  supportWhatsAppPlaceholder: string;
  companyAddressPlaceholder: string;
}

export interface DashboardSummary {
  profile: Profile;
  recentCommissions: Commission[];
  recentPoints: PointsLedger[];
  recentNotifications: Notification[];
  recentWithdrawals: Withdrawal[];
  teamStats: {
    l1Count: number;
    l2Count: number;
    l3Count: number;
    l4Count: number;
    activeCount: number;
    pendingCount: number;
  };
}
