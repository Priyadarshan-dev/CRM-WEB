import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { CheckCircle2, Bell, UserPlus, Target, AlertTriangle, X } from 'lucide-react';
import { useAuth } from './AuthContext';

// ─── Helpers ────────────────────────────────────────────────────────────────
const NOTIF_KEY = 'crm_mock_notifications';

export const getMockNotifications = () => {
  try {
    const saved = localStorage.getItem(NOTIF_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch { return []; }
};

export const saveMockNotifications = (notifications) => {
  localStorage.setItem(NOTIF_KEY, JSON.stringify(notifications));
};

export const pushNotification = (notification) => {
  const existing = getMockNotifications();
  const newNotif = {
    id: Date.now() + Math.random(),
    read: false,
    timestamp: Date.now(),
    ...notification,
  };
  saveMockNotifications([newNotif, ...existing]);
  return newNotif;
};

// ─── Icon Map ─────────────────────────────────────────────────────────────────
const ICON_MAP = {
  lead_assigned: { icon: Target, color: 'text-blue-500', bg: 'bg-blue-50' },
  user_created:  { icon: UserPlus, color: 'text-purple-500', bg: 'bg-purple-50' },
  all_assigned:  { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50' },
  warning:       { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50' },
  default:       { icon: Bell, color: 'text-slate-500', bg: 'bg-slate-100' },
};

// ─── Toast Component ──────────────────────────────────────────────────────────
const Toast = ({ notification, onDismiss }) => {
  const style = ICON_MAP[notification.type] || ICON_MAP.default;
  const Icon = style.icon;

  useEffect(() => {
    const timer = setTimeout(() => onDismiss(notification.id), 4500);
    return () => clearTimeout(timer);
  }, [notification.id, onDismiss]);

  return (
    <div className="flex items-start gap-3 bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 w-80 animate-slideIn">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${style.bg}`}>
        <Icon className={`w-4 h-4 ${style.color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-slate-900">{notification.title}</p>
        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{notification.message}</p>
      </div>
      <button
        onClick={() => onDismiss(notification.id)}
        className="text-slate-300 hover:text-slate-500 transition-colors flex-shrink-0 mt-0.5"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

// ─── Context ──────────────────────────────────────────────────────────────────
const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [toasts, setToasts] = useState([]);
  const seenIdsRef = useRef(new Set());

  // Poll localStorage every 3 seconds for new notifications
  useEffect(() => {
    if (!user) return;

    const checkNotifications = () => {
      const all = getMockNotifications();
      const mine = all.filter(n => n.recipientId === user.id);
      setNotifications(mine);

      // Show toast for newly seen unread notifications
      const newUnread = mine.filter(
        n => !n.read && !seenIdsRef.current.has(n.id)
      );
      newUnread.forEach(n => {
        seenIdsRef.current.add(n.id);
        setToasts(prev => [...prev, n]);
      });
    };

    checkNotifications();
    const interval = setInterval(checkNotifications, 3000);
    return () => clearInterval(interval);
  }, [user]);

  const markAsRead = useCallback((notifId) => {
    const all = getMockNotifications();
    const updated = all.map(n => n.id === notifId ? { ...n, read: true } : n);
    saveMockNotifications(updated);
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, read: true } : n));
  }, []);

  const markAllRead = useCallback(() => {
    if (!user) return;
    const all = getMockNotifications();
    const updated = all.map(n => n.recipientId === user.id ? { ...n, read: true } : n);
    saveMockNotifications(updated);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, [user]);

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllRead, iconMap: ICON_MAP }}>
      {children}

      {/* Toast Container */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3">
        {toasts.map(toast => (
          <Toast key={toast.id} notification={toast} onDismiss={dismissToast} />
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
};
