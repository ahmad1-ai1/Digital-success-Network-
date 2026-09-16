import { devStore } from '../store/devStore';
import { PointsLedger } from '../types';

export const pointsService = {
  getPoints(userId: string): number {
    const profile = devStore.getData().profiles[userId];
    return profile ? profile.currentPoints : 0;
  },

  getTotalPoints(userId: string): number {
    return this.getPoints(userId);
  },

  getLedger(userId: string): PointsLedger[] {
    const all = devStore.getData().pointsLedger;
    return all.filter(entry => entry.userId === userId).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  getAllLedgerEntries(): PointsLedger[] {
    return [...devStore.getData().pointsLedger].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
};
