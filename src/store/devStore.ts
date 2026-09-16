import {
  User,
  Profile,
  Referral,
  ReferralClick,
  PaymentProof,
  KYCRecord,
  PointsLedger,
  Commission,
  SpinPrize,
  Spin,
  Withdrawal,
  Notification,
  Badge,
  Product,
  SupportTicket,
  AuditLog,
  BusinessSettings,
  RankName
} from '../types';

export interface DevDatabase {
  users: User[];
  profiles: Record<string, Profile>;
  referrals: Referral[];
  referralClicks: ReferralClick[];
  paymentProofs: PaymentProof[];
  kycRecords: KYCRecord[];
  pointsLedger: PointsLedger[];
  commissions: Commission[];
  spinPrizes: SpinPrize[];
  spinHistory: Spin[];
  withdrawals: Withdrawal[];
  notifications: Notification[];
  badges: Badge[];
  products: Product[];
  supportTickets: SupportTicket[];
  auditLogs: AuditLog[];
  settings: BusinessSettings;
  currentUserId: string | null;
}

const DEFAULT_SETTINGS: BusinessSettings = {
  activationFeePKR: 1300,
  commissionRates: {
    level1: 0.20, // 20%
    level2: 0.10, // 10%
    level3: 0.05, // 5%
    level4: 0.03  // 3%
  },
  directJoiningPoints: 50,
  indirectJoiningPoints: 25,
  rankThresholds: {
    Starter: 500,
    Silver: 1500,
    Gold: 3000,
    Platinum: 5000,
    Diamond: 8000,
    Crown: 10000
  },
  withdrawalMinPKR: 20,
  withdrawalFeeRate: 0.02, // 2%
  supportEmail: 'support@digitalsuccessnetwork.pk',
  supportWhatsAppPlaceholder: 'Official DSN Helpdesk',
  companyAddressPlaceholder: 'Blue Area, Islamabad, Pakistan'
};

const DEFAULT_PRIZES: SpinPrize[] = [
  { id: 'prize-1', name: '50 Points', type: 'points', value: 50, label: '+50 Pts', weight: 35, color: '#2563eb', active: true },
  { id: 'prize-2', name: '100 PKR Bonus', type: 'cash', value: 100, label: '100 PKR', weight: 15, color: '#16a34a', active: true },
  { id: 'prize-3', name: '25 Points', type: 'points', value: 25, label: '+25 Pts', weight: 30, color: '#d97706', active: true },
  { id: 'prize-4', name: 'Try Again Next Time', type: 'none', value: 0, label: 'Try Again', weight: 10, color: '#64748b', active: true },
  { id: 'prize-5', name: '200 PKR Bonus', type: 'cash', value: 200, label: '200 PKR', weight: 5, color: '#9333ea', active: true },
  { id: 'prize-6', name: '100 Points', type: 'points', value: 100, label: '+100 Pts', weight: 5, color: '#ea580c', active: true }
];

const DEFAULT_BADGES: Badge[] = [
  { id: 'badge-1', name: 'Fast Starter', description: 'Activated your account and completed initial setup', iconName: 'Zap', criteria: 'Account Active' },
  { id: 'badge-2', name: 'Top Recruiter', description: 'Enrolled 5 or more direct team members', iconName: 'Users', criteria: '5 Direct Members' },
  { id: 'badge-3', name: 'Team Builder', description: 'Built an active network reaching Level 3', iconName: 'Network', criteria: 'Reach Level 3' },
  { id: 'badge-4', name: 'Rising Star', description: 'Earned 1,500 points and reached Silver Rank', iconName: 'Star', criteria: 'Silver Rank' },
  { id: 'badge-5', name: 'Consistent Performer', description: 'Active withdrawals and team engagement', iconName: 'Award', criteria: 'Consistent Activity' }
];

const STORAGE_KEY = 'dsn_supabase_state_v3';

const SEED_USERS: User[] = [
  {
    id: 'usr-admin-01',
    fullName: 'DSN Chief Administrator',
    email: 'admin@digitalsuccessnetwork.pk',
    phone: '+92 300 1234567',
    role: 'admin',
    referralCode: 'DSN-ADMIN',
    sponsorId: null,
    sponsorCode: null,
    accountStatus: 'active',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'usr-member-01',
    fullName: 'Muhammad Ahmad',
    email: 'member@digitalsuccessnetwork.pk',
    phone: '+92 301 9876543',
    role: 'member',
    referralCode: 'DSN-AHMAD',
    sponsorId: 'usr-admin-01',
    sponsorCode: 'DSN-ADMIN',
    accountStatus: 'active',
    createdAt: '2025-01-15T00:00:00.000Z',
    updatedAt: '2025-01-15T00:00:00.000Z'
  }
];

const SEED_PROFILES: Record<string, Profile> = {
  'usr-admin-01': {
    ...SEED_USERS[0],
    currentRank: 'Crown',
    currentPoints: 12500,
    availableBalance: 25000,
    totalEarnings: 85000,
    pendingWithdrawals: 0,
    spinCredits: 5,
    directTeamCount: 12,
    totalTeamCount: 48,
    kycStatus: 'approved',
    paymentProofStatus: 'approved'
  },
  'usr-member-01': {
    ...SEED_USERS[1],
    currentRank: 'Gold',
    currentPoints: 3450,
    availableBalance: 4200,
    totalEarnings: 15800,
    pendingWithdrawals: 0,
    spinCredits: 3,
    directTeamCount: 5,
    totalTeamCount: 18,
    kycStatus: 'approved',
    paymentProofStatus: 'approved'
  }
};

const SEED_PRODUCTS: Product[] = [
  {
    id: 'prod-01',
    name: 'Digital Skills & Affiliate Foundations Course',
    slug: 'digital-skills-affiliate-foundations',
    description: 'Comprehensive beginner-to-advanced curriculum on digital marketing, network growth, and team building strategies.',
    category: 'Courses',
    price: 1500,
    status: 'active',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'prod-02',
    name: 'Social Media Mastery & Personal Branding Toolkit',
    slug: 'social-media-mastery-toolkit',
    description: 'Templates, graphic assets, and outreach frameworks to build high-converting referral campaigns.',
    category: 'Digital Tools',
    price: 2500,
    status: 'active',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z'
  }
];


export function getInitialSeedData(): DevDatabase {
  return {
    users: [...SEED_USERS],
    profiles: { ...SEED_PROFILES },
    referrals: [
      {
        id: 'ref-01',
        referrerId: 'usr-admin-01',
        referredUserId: 'usr-member-01',
        level: 1,
        registeredAt: '2025-01-15T00:00:00.000Z',
        activatedAt: '2025-01-16T00:00:00.000Z',
        status: 'active'
      }
    ],
    referralClicks: [],
    paymentProofs: [],
    kycRecords: [],
    pointsLedger: [
      {
        id: 'pts-01',
        userId: 'usr-member-01',
        sourceUserId: 'usr-admin-01',
        sourceUserName: 'DSN Chief Administrator',
        level: 1,
        activity: 'Direct team registration bonus',
        points: 50,
        createdAt: '2025-01-16T00:00:00.000Z'
      }
    ],
    commissions: [
      {
        id: 'com-01',
        userId: 'usr-admin-01',
        sourceUserId: 'usr-member-01',
        sourceUserName: 'Muhammad Ahmad',
        level: 1,
        eligibleAmount: 1300,
        rate: 0.20,
        commission: 260,
        status: 'credited',
        createdAt: '2025-01-16T00:00:00.000Z'
      }
    ],
    spinPrizes: DEFAULT_PRIZES,
    spinHistory: [],
    withdrawals: [],
    notifications: [],
    badges: DEFAULT_BADGES,
    products: [...SEED_PRODUCTS],
    supportTickets: [],
    auditLogs: [],
    settings: DEFAULT_SETTINGS,
    currentUserId: null
  };
}

export class DevStore {
  private data: DevDatabase;

  constructor() {
    this.data = this.load();
  }

  private load(): DevDatabase {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.settings) {
          // Guarantee latest business rules for joining fee and minimum withdrawal
          parsed.settings.activationFeePKR = 1300;
          parsed.settings.withdrawalMinPKR = 20;
          parsed.settings.withdrawalFeeRate = 0.02;

          if (!parsed.users || parsed.users.length === 0) {
            parsed.users = [...SEED_USERS];
            parsed.profiles = { ...SEED_PROFILES, ...(parsed.profiles || {}) };
            parsed.products = [...SEED_PRODUCTS, ...(parsed.products || [])];
          }
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read from localStorage, using initial seed data', e);
    }
    const initial = getInitialSeedData();
    this.saveToStorage(initial);
    return initial;
  }

  private saveToStorage(data: DevDatabase): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Error saving to localStorage', e);
    }
  }

  public getData(): DevDatabase {
    return this.data;
  }

  public save(updater: (draft: DevDatabase) => void): DevDatabase {
    updater(this.data);
    this.saveToStorage(this.data);
    return this.data;
  }

  public reset(): DevDatabase {
    const initial = getInitialSeedData();
    this.data = initial;
    this.saveToStorage(initial);
    return initial;
  }
}

export const devStore = new DevStore();
