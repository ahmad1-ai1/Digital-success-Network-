import { devStore } from '../store/devStore';
import { Notification } from '../types';

export const notificationService = {
  getNotifications(userId: string): Notification[] {
    return devStore.getData().notifications.filter(n => n.userId === userId).sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  getUnreadCount(userId: string): number {
    return devStore.getData().notifications.filter(n => n.userId === userId && !n.read).length;
  },

  markRead(notificationId: string): void {
    devStore.save(data => {
      const item = data.notifications.find(n => n.id === notificationId);
      if (item) {
        item.read = true;
      }
    });
  },

  markAllRead(userId: string): void {
    devStore.save(data => {
      for (const n of data.notifications) {
        if (n.userId === userId) {
          n.read = true;
        }
      }
    });
  },

  createNotification(
    userId: string,
    title: string,
    message: string,
    type: Notification['type']
  ): Notification {
    const notif: Notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      userId,
      title,
      message,
      type,
      read: false,
      createdAt: new Date().toISOString()
    };

    devStore.save(data => {
      data.notifications.unshift(notif);
    });

    return notif;
  }
};
