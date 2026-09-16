import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { notificationService } from '../../services';
import {
  Bell,
  CheckCircle2,
  Users,
  DollarSign,
  Zap,
  Award,
  Gift,
  AlertCircle
} from 'lucide-react';

export const NotificationsView: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { success } = useToast();

  if (!user) return null;

  const notifications = notificationService.getNotifications(user.id);

  const handleMarkAll = () => {
    notificationService.markAllRead(user.id);
    refreshUser();
    success('All notifications marked as read.');
  };

  const handleMarkOne = (id: string) => {
    notificationService.markRead(id);
    refreshUser();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'new_team_member':
        return <Users className="w-5 h-5 text-blue-600" />;
      case 'commission_received':
        return <DollarSign className="w-5 h-5 text-emerald-600" />;
      case 'points_received':
        return <Zap className="w-5 h-5 text-blue-600" />;
      case 'rank_achieved':
        return <Award className="w-5 h-5 text-amber-600" />;
      case 'spin_available':
        return <Gift className="w-5 h-5 text-purple-600" />;
      default:
        return <Bell className="w-5 h-5 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 font-display">
            Notifications & Alerts
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time updates regarding activations, commissions, points, and network news.
          </p>
        </div>

        {notifications.some(n => !n.read) && (
          <button
            onClick={handleMarkAll}
            className="px-3.5 py-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
          >
            Mark All Read
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {notifications.map(n => (
          <div
            key={n.id}
            onClick={() => !n.read && handleMarkOne(n.id)}
            className={`p-5 flex items-start gap-4 transition-colors cursor-pointer ${
              !n.read ? 'bg-blue-50/40' : 'hover:bg-slate-50/60'
            }`}
          >
            <div className="p-2.5 rounded-2xl bg-white border border-slate-100 shadow-xs shrink-0 mt-0.5">
              {getIcon(n.type)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-bold text-slate-900">{n.title}</h2>
                <span className="text-[11px] text-slate-400 shrink-0">
                  {new Date(n.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
            </div>

            {!n.read && (
              <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-2" />
            )}
          </div>
        ))}

        {notifications.length === 0 && (
          <div className="p-12 text-center text-slate-400 text-xs">
            No notifications in your inbox.
          </div>
        )}
      </div>
    </div>
  );
};
