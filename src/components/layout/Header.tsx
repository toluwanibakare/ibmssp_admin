import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, ChevronDown, LogOut, Settings, CheckCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { timeAgo } from '@/lib/utils-ui';

const NOTIFICATION_READ_KEY = 'ibmssp_admin_notifications_read';

function readReadNotifications(): number[] {
  try {
    const raw = localStorage.getItem(NOTIFICATION_READ_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is number => typeof id === 'number');
  } catch {
    return [];
  }
}

export function Header() {
  const { user, logout } = useAuth();
  const { members, logs } = useData();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [readNotificationIds, setReadNotificationIds] = useState<number[]>(() => readReadNotifications());
  const notificationsRef = useRef<HTMLDivElement | null>(null);

  const searchResults = query.trim().length > 1
    ? members.filter(m =>
      m.public_id?.toLowerCase().includes(query.toLowerCase()) ||
      `${m.first_name} ${m.last_name}`.toLowerCase().includes(query.toLowerCase()) ||
      m.email?.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5)
    : [];

  const notifications = logs.slice(0, 20);
  const unreadCount = notifications.filter(log => !readNotificationIds.includes(log.id)).length;

  const persistReadNotifications = (ids: number[]) => {
    setReadNotificationIds(ids);
    localStorage.setItem(NOTIFICATION_READ_KEY, JSON.stringify(ids));
  };

  const markNotificationRead = (id: number) => {
    if (readNotificationIds.includes(id)) return;
    persistReadNotifications([...readNotificationIds, id]);
  };

  const markAllNotificationsRead = () => {
    const allVisibleIds = Array.from(new Set([...readNotificationIds, ...notifications.map(n => n.id)]));
    persistReadNotifications(allVisibleIds);
  };

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!showNotifications) return;
      if (!notificationsRef.current) return;
      if (notificationsRef.current.contains(event.target as Node)) return;
      setShowNotifications(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [showNotifications]);

  return (
    <header className="h-14 bg-card border-b border-border flex items-center px-5 gap-4 sticky top-0 z-10">
      <div className="flex-1 max-w-md relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input value={query}
          onChange={e => { setQuery(e.target.value); setShowSearch(e.target.value.trim().length > 1); }}
          onBlur={() => setTimeout(() => setShowSearch(false), 200)}
          placeholder="Search members by name, ID or email..."
          className="w-full pl-8 pr-3 py-1.5 text-sm rounded-lg border border-border bg-muted/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary focus:bg-card transition-all" />
        {showSearch && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-dropdown overflow-hidden z-50">
            {searchResults.map(m => (
              <button key={m.member_id} onClick={() => { navigate(`/members/${m.member_id}`); setQuery(''); setShowSearch(false); }}
                className="w-full text-left px-4 py-2.5 hover:bg-accent/50 flex items-center gap-3 transition-colors">
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
                  {m.first_name?.charAt(0)}{m.last_name?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{m.first_name} {m.last_name}</p>
                  <p className="text-xs text-muted-foreground">{m.public_id || 'PENDING'} · <span className="capitalize">{m.category}</span></p>
                </div>
              </button>
            ))}
          </div>
        )}
        {showSearch && searchResults.length === 0 && query.length > 1 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-dropdown p-4 text-center text-sm text-muted-foreground z-50">No results found</div>
        )}
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <div className="relative" ref={notificationsRef}>
          <button
            type="button"
            onClick={() => setShowNotifications(v => !v)}
            className="relative p-2 rounded-lg hover:bg-accent transition-colors"
            aria-label="Notifications"
          >
            <Bell size={16} className="text-muted-foreground" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-destructive text-[10px] leading-4 text-white text-center font-semibold">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          {showNotifications && (
            <div className="absolute right-0 top-full mt-1 w-[min(92vw,380px)] bg-card border border-border rounded-xl shadow-dropdown overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-border flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold">Notifications</p>
                  <p className="text-xs text-muted-foreground">
                    {unreadCount} unread of {notifications.length}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={markAllNotificationsRead}
                  className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors whitespace-nowrap"
                >
                  <CheckCheck size={12} /> Mark all read
                </button>
              </div>
              <div className="max-h-[60vh] overflow-y-auto divide-y divide-border">
                {notifications.length === 0 && (
                  <div className="px-4 py-6 text-sm text-center text-muted-foreground">No notifications yet</div>
                )}
                {notifications.map(log => {
                  const isRead = readNotificationIds.includes(log.id);
                  return (
                    <button
                      key={log.id}
                      type="button"
                      onClick={() => markNotificationRead(log.id)}
                      className="w-full text-left px-4 py-3 hover:bg-accent/40 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${isRead ? 'bg-muted-foreground/50' : 'bg-primary'}`} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm leading-snug break-words [overflow-wrap:anywhere]">{log.description}</p>
                            <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded shrink-0 ${isRead ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary'}`}>
                              {isRead ? 'Read' : 'Unread'}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{timeAgo(log.created_at)}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        <div className="relative">
          <button onClick={() => setShowDropdown(d => !d)} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-accent transition-colors">
            <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-xs font-semibold text-primary-foreground">{user?.name?.charAt(0) || 'A'}</div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-medium leading-none">{user?.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5 capitalize">{user?.role}</p>
            </div>
            <ChevronDown size={13} className="text-muted-foreground" />
          </button>
          {showDropdown && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-xl shadow-dropdown py-1 z-50">
              <button onClick={() => { navigate('/settings'); setShowDropdown(false); }} className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-accent/50 transition-colors">
                <Settings size={14} className="text-muted-foreground" /> Settings
              </button>
              <div className="my-1 border-t border-border" />
              <button onClick={() => { logout(); navigate('/login'); }} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-destructive hover:bg-destructive/5 transition-colors">
                <LogOut size={14} /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
