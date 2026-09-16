import { devStore } from '../store/devStore';
import { RankName, Rank } from '../types';

export const rankService = {
  getThresholds(): Record<RankName, number> {
    return devStore.getData().settings.rankThresholds;
  },

  getRankThresholds(): Record<RankName, number> {
    return this.getThresholds();
  },

  getAllRanks(): Rank[] {
    const thresholds = this.getThresholds();
    return [
      { name: 'Starter', threshold: thresholds.Starter, color: '#3b82f6', description: 'Entry tier - 500 points' },
      { name: 'Silver', threshold: thresholds.Silver, color: '#94a3b8', description: 'Silver tier - 1,500 points' },
      { name: 'Gold', threshold: thresholds.Gold, color: '#eab308', description: 'Gold tier - 3,000 points' },
      { name: 'Platinum', threshold: thresholds.Platinum, color: '#06b6d4', description: 'Platinum tier - 5,000 points' },
      { name: 'Diamond', threshold: thresholds.Diamond, color: '#8b5cf6', description: 'Diamond tier - 8,000 points' },
      { name: 'Crown', threshold: thresholds.Crown, color: '#ec4899', description: 'Crown tier - 10,000 points' }
    ];
  },

  calculateRank(points: number): RankName {
    const thresholds = this.getThresholds();
    if (points >= thresholds.Crown) return 'Crown';
    if (points >= thresholds.Diamond) return 'Diamond';
    if (points >= thresholds.Platinum) return 'Platinum';
    if (points >= thresholds.Gold) return 'Gold';
    if (points >= thresholds.Silver) return 'Silver';
    return 'Starter';
  },

  getRankProgress(points: number): {
    currentRank: RankName;
    nextRank: RankName | null;
    currentPoints: number;
    nextThreshold: number;
    pointsRemaining: number;
    neededPoints: number;
    progressPercentage: number;
    progressPercent: number;
  } {
    const thresholds = this.getThresholds();
    const currentRank = this.calculateRank(points);
    const ranksOrder: RankName[] = ['Starter', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Crown'];
    const currentIndex = ranksOrder.indexOf(currentRank);

    if (currentIndex === ranksOrder.length - 1) {
      return {
        currentRank,
        nextRank: null,
        currentPoints: points,
        nextThreshold: thresholds.Crown,
        pointsRemaining: 0,
        neededPoints: 0,
        progressPercentage: 100,
        progressPercent: 100
      };
    }

    const nextRank = ranksOrder[currentIndex + 1];
    const prevThreshold = currentIndex === 0 ? 0 : thresholds[ranksOrder[currentIndex]];
    const nextThreshold = thresholds[nextRank];
    const pointsRemaining = Math.max(0, nextThreshold - points);
    const range = nextThreshold - prevThreshold;
    const progress = Math.min(100, Math.max(0, Math.round(((points - prevThreshold) / range) * 100)));

    return {
      currentRank,
      nextRank,
      currentPoints: points,
      nextThreshold,
      pointsRemaining,
      neededPoints: pointsRemaining,
      progressPercentage: progress,
      progressPercent: progress
    };
  }
};
