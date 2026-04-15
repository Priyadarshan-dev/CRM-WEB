import React from 'react';
import { useNotifications } from '../../../core/context/NotificationContext';
import { CheckCircle2, Bell } from 'lucide-react';

const Notifications = () => {
  const { notifications, markAsRead, markAllRead, iconMap } = useNotifications();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
          <p className="text-sm text-slate-500 mt-1">Stay updated with your latest alerts and tasks.</p>
        </div>
        {notifications.length > 0 && notifications.some(n => !n.read) && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:text-primary hover:border-primary/30 transition-all shadow-sm"
          >
            <CheckCircle2 className="w-4 h-4" />
            Mark All as Read
          </button>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-[28px] overflow-hidden shadow-sm">
        {notifications.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-4">
              <Bell className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="font-bold text-slate-700">No notifications yet</h3>
            <p className="text-sm text-slate-500 mt-1">You're all caught up! Check back later.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {notifications.map((notif) => {
              const style = iconMap[notif.type] || iconMap.default;
              const Icon = style.icon;
              return (
                <div
                  key={notif.id}
                  className={`p-6 flex items-start gap-4 transition-colors cursor-pointer ${notif.read ? 'bg-white hover:bg-slate-50' : 'bg-primary/[0.03] hover:bg-primary/[0.05]'}`}
                  onClick={() => !notif.read && markAsRead(notif.id)}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${style.bg}`}>
                    <Icon className={`w-6 h-6 ${style.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className={`text-sm ${notif.read ? 'font-semibold text-slate-700' : 'font-bold text-slate-900'}`}>
                        {notif.title}
                      </h4>
                      {!notif.read && (
                        <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-[10px] font-bold uppercase tracking-wider">New</span>
                      )}
                    </div>
                    <p className={`mt-1 text-sm ${notif.read ? 'text-slate-500' : 'text-slate-600'}`}>
                      {notif.message}
                    </p>
                    <p className="mt-2 text-xs text-slate-400 font-medium">
                      {new Date(notif.timestamp).toLocaleString(undefined, {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
