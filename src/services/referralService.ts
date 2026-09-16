import { devStore } from '../store/devStore';
import { User, Profile, AccountStatus } from '../types';

export interface TeamMemberItem {
  user: User;
  profile: Profile;
  level: 1 | 2 | 3 | 4;
  sponsorName: string;
  sponsorCode: string;
  registeredAt: string;
  status: AccountStatus;

  // Flattened convenient properties for UI consumption
  userId: string;
  fullName: string;
  referralCode: string;
  accountStatus: AccountStatus;
  joinedAt: string;
  sponsorId: string | null;
}

export const referralService = {
  getReferralLink(code: string): string {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://digitalsuccessnetwork.pk';
    return `${origin}/register?ref=${encodeURIComponent(code)}`;
  },

  trackClick(code: string, device = 'Browser Web'): void {
    devStore.save(db => {
      const sponsor = db.users.find(u => u.referralCode === code);
      if (sponsor) {
        db.referralClicks.push({
          id: `clk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          referralCode: code,
          referrerId: sponsor.id,
          device,
          createdAt: new Date().toISOString(),
          converted: false
        });
      }
    });
  },

  getReferralStats(userId: string): {
    totalClicks: number;
    totalRegistrations: number;
    totalActivations: number;
    conversionRate: number;
  } {
    const db = devStore.getData();
    const user = db.users.find(u => u.id === userId);
    if (!user) {
      return { totalClicks: 0, totalRegistrations: 0, totalActivations: 0, conversionRate: 0 };
    }

    const clicks = db.referralClicks.filter(c => c.referrerId === userId).length;
    // Direct Level 1 team
    const directUsers = db.users.filter(u => u.sponsorId === userId);
    const totalRegistrations = directUsers.length;
    const totalActivations = directUsers.filter(u => u.accountStatus === 'active').length;
    const conversionRate = totalRegistrations > 0 ? Math.round((totalActivations / totalRegistrations) * 100) : 0;

    return {
      totalClicks: Math.max(clicks, totalRegistrations + 3), // realistic demo baseline
      totalRegistrations,
      totalActivations,
      conversionRate
    };
  },

  getReferralData(userId: string) {
    const db = devStore.getData();
    const user = db.users.find(u => u.id === userId);
    const stats = this.getReferralStats(userId);
    const team = this.getTeam(userId);
    const referralCode = user?.referralCode || '';
    const referralLink = this.getReferralLink(referralCode);

    return {
      referralCode,
      referralLink,
      stats: {
        clicks: stats.totalClicks,
        signups: stats.totalRegistrations,
        activations: stats.totalActivations,
        conversionRate: stats.conversionRate
      },
      teamCounts: team.counts
    };
  },

  getTeam(userId: string): {
    level1: TeamMemberItem[];
    level2: TeamMemberItem[];
    level3: TeamMemberItem[];
    level4: TeamMemberItem[];
    levels: {
      l1: TeamMemberItem[];
      l2: TeamMemberItem[];
      l3: TeamMemberItem[];
      l4: TeamMemberItem[];
    };
    allMembers: TeamMemberItem[];
    counts: { l1: number; l2: number; l3: number; l4: number; total: number; active: number; pending: number };
  } {
    const db = devStore.getData();
    const l1: TeamMemberItem[] = [];
    const l2: TeamMemberItem[] = [];
    const l3: TeamMemberItem[] = [];
    const l4: TeamMemberItem[] = [];

    // Level 1: users sponsored by userId
    const l1Users = db.users.filter(u => u.sponsorId === userId);
    for (const u of l1Users) {
      const prof = db.profiles[u.id] || { ...u, currentRank: 'Starter', currentPoints: 0, availableBalance: 0, totalEarnings: 0, pendingWithdrawals: 0, spinCredits: 0, directTeamCount: 0, totalTeamCount: 0, kycStatus: 'not_submitted', paymentProofStatus: 'pending' };
      const sponsor = db.users.find(s => s.id === u.sponsorId);
      l1.push({
        user: u,
        profile: prof,
        level: 1,
        sponsorName: sponsor?.fullName || 'Direct',
        sponsorCode: sponsor?.referralCode || 'ROOT',
        registeredAt: u.createdAt,
        status: u.accountStatus,
        userId: u.id,
        fullName: u.fullName,
        referralCode: u.referralCode,
        accountStatus: u.accountStatus,
        joinedAt: u.createdAt,
        sponsorId: u.sponsorId
      });
    }

    // Level 2: users sponsored by L1
    const l1Ids = new Set(l1.map(item => item.user.id));
    const l2Users = db.users.filter(u => u.sponsorId && l1Ids.has(u.sponsorId));
    for (const u of l2Users) {
      const prof = db.profiles[u.id] || { ...u, currentRank: 'Starter', currentPoints: 0, availableBalance: 0, totalEarnings: 0, pendingWithdrawals: 0, spinCredits: 0, directTeamCount: 0, totalTeamCount: 0, kycStatus: 'not_submitted', paymentProofStatus: 'pending' };
      const sponsor = db.users.find(s => s.id === u.sponsorId);
      l2.push({
        user: u,
        profile: prof,
        level: 2,
        sponsorName: sponsor?.fullName || 'L1 Member',
        sponsorCode: sponsor?.referralCode || '',
        registeredAt: u.createdAt,
        status: u.accountStatus,
        userId: u.id,
        fullName: u.fullName,
        referralCode: u.referralCode,
        accountStatus: u.accountStatus,
        joinedAt: u.createdAt,
        sponsorId: u.sponsorId
      });
    }

    // Level 3: users sponsored by L2
    const l2Ids = new Set(l2.map(item => item.user.id));
    const l3Users = db.users.filter(u => u.sponsorId && l2Ids.has(u.sponsorId));
    for (const u of l3Users) {
      const prof = db.profiles[u.id] || { ...u, currentRank: 'Starter', currentPoints: 0, availableBalance: 0, totalEarnings: 0, pendingWithdrawals: 0, spinCredits: 0, directTeamCount: 0, totalTeamCount: 0, kycStatus: 'not_submitted', paymentProofStatus: 'pending' };
      const sponsor = db.users.find(s => s.id === u.sponsorId);
      l3.push({
        user: u,
        profile: prof,
        level: 3,
        sponsorName: sponsor?.fullName || 'L2 Member',
        sponsorCode: sponsor?.referralCode || '',
        registeredAt: u.createdAt,
        status: u.accountStatus,
        userId: u.id,
        fullName: u.fullName,
        referralCode: u.referralCode,
        accountStatus: u.accountStatus,
        joinedAt: u.createdAt,
        sponsorId: u.sponsorId
      });
    }

    // Level 4: users sponsored by L3
    const l3Ids = new Set(l3.map(item => item.user.id));
    const l4Users = db.users.filter(u => u.sponsorId && l3Ids.has(u.sponsorId));
    for (const u of l4Users) {
      const prof = db.profiles[u.id] || { ...u, currentRank: 'Starter', currentPoints: 0, availableBalance: 0, totalEarnings: 0, pendingWithdrawals: 0, spinCredits: 0, directTeamCount: 0, totalTeamCount: 0, kycStatus: 'not_submitted', paymentProofStatus: 'pending' };
      const sponsor = db.users.find(s => s.id === u.sponsorId);
      l4.push({
        user: u,
        profile: prof,
        level: 4,
        sponsorName: sponsor?.fullName || 'L3 Member',
        sponsorCode: sponsor?.referralCode || '',
        registeredAt: u.createdAt,
        status: u.accountStatus,
        userId: u.id,
        fullName: u.fullName,
        referralCode: u.referralCode,
        accountStatus: u.accountStatus,
        joinedAt: u.createdAt,
        sponsorId: u.sponsorId
      });
    }

    const allMembers = [...l1, ...l2, ...l3, ...l4];
    const active = allMembers.filter(m => m.status === 'active').length;
    const pending = allMembers.filter(m => m.status === 'pending_activation' || m.status === 'pending_verification').length;

    return {
      level1: l1,
      level2: l2,
      level3: l3,
      level4: l4,
      levels: {
        l1,
        l2,
        l3,
        l4
      },
      allMembers,
      counts: {
        l1: l1.length,
        l2: l2.length,
        l3: l3.length,
        l4: l4.length,
        total: allMembers.length,
        active,
        pending
      }
    };
  }
};
