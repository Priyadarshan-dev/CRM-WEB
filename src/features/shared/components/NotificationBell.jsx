import React from 'react';
import { Bell, Check, CheckCheck, Clock } from 'lucide-react';
import { useNotifications } from '../../../core/context/NotificationContext';

const timeAgo = (timestamp) => {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const NotificationBell = () => {
  const { notifications, unreadCount, markAsRead, markAllRead, iconMap } = useNotifications();
  const [isOpen, setIsOpen] = React.useState(false);
  const panelRef = React.useRef(null);

  // Close on outside click
  React.useEffect(() => {
    const handleClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <button
        id="notification-bell"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl hover:bg-slate-100 transition-all group"
      >
        <Bell className={`w-5 h-5 transition-colors ${unreadCount > 0 ? 'text-slate-700' : 'text-slate-400'} group-hover:text-primary`} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center animate-pulse shadow-lg shadow-red-200">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-50 animate-fadeIn">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
              <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
                {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1.5 text-[11px] font-bold text-primary hover:text-primary/80 transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Bell className="w-5 h-5 text-slate-300" />
                </div>
                <p className="text-sm font-medium text-slate-400">No notifications yet</p>
                <p className="text-[11px] text-slate-300 mt-1">Actions from your team will appear here.</p>
              </div>
            ) : (
              notifications.slice(0, 15).map(notif => {
                const style = iconMap[notif.type] || iconMap.default;
                const Icon = style.icon;
                return (
                  <div
                    key={notif.id}
                    onClick={() => markAsRead(notif.id)}
                    className={`flex items-start gap-3 px-5 py-3.5 cursor-pointer transition-all hover:bg-slate-50 ${
                      !notif.read ? 'bg-primary/[0.03]' : ''
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${style.bg}`}>
                      <Icon className={`w-4 h-4 ${style.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm truncate ${!notif.read ? 'font-bold text-slate-900' : 'font-medium text-slate-600'}`}>
                          {notif.title}
                        </p>
                        {!notif.read && (
                          <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">{notif.message}</p>
                      <div className="flex items-center gap-1 mt-1.5 text-[10px] text-slate-300 font-medium">
                        <Clock className="w-3 h-3" />
                        {timeAgo(notif.timestamp)}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 text-center">
              <p className="text-[11px] text-slate-400 font-medium">
                Showing latest {Math.min(notifications.length, 15)} of {notifications.length}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
