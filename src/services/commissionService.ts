import { devStore } from '../store/devStore';
import { Commission } from '../types';

export const commissionService = {
  getCommissions(userId: string): Commission[] {
    const all = devStore.getData().commissions;
    return all.filter(c => c.userId === userId).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  getAllCommissions(): Commission[] {
    return [...devStore.getData().commissions].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  getCommissionSummary(userId: string): {
    totalCommission: number;
    total: number;
    level1Total: number;
    level2Total: number;
    level3Total: number;
    level4Total: number;
    byLevel: {
      l1: number;
      l2: number;
      l3: number;
      l4: number;
    };
    recentCommissions: Commission[];
  } {
    const list = this.getCommissions(userId);
    let totalCommission = 0;
    let level1Total = 0;
    let level2Total = 0;
    let level3Total = 0;
    let level4Total = 0;

    for (const c of list) {
      if (c.status === 'credited') {
        totalCommission += c.commission;
        if (c.level === 1) level1Total += c.commission;
        else if (c.level === 2) level2Total += c.commission;
        else if (c.level === 3) level3Total += c.commission;
        else if (c.level === 4) level4Total += c.commission;
      }
    }

    return {
      totalCommission,
      total: totalCommission,
      level1Total,
      level2Total,
      level3Total,
      level4Total,
      byLevel: {
        l1: level1Total,
        l2: level2Total,
        l3: level3Total,
        l4: level4Total
      },
      recentCommissions: list.slice(0, 5)
    };
  }
};
