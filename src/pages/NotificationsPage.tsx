import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { ChevronLeft, Bell, Mail, Heart, MessageSquare, UserPlus, Trophy, CheckCheck, User } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useSettings } from '@/hooks/useSettings';
import { useAuth } from '@/contexts/AuthContext';
import { NotificationItem } from '@/types/community';
import { subscribeUserNotifications, markNotificationRead, markAllNotificationsRead } from '@/lib/communityService';

export default function NotificationsPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { settings, settingsLoading, updateSetting } = useSettings();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loadingNotifs, setLoadingNotifs] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoadingNotifs(true);
    const unsub = subscribeUserNotifications(user.uid, (list) => {
      setNotifications(list);
      setLoadingNotifs(false);
    });
    return () => unsub();
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotificationClick = async (notif: NotificationItem) => {
    if (!notif.read) {
      await markNotificationRead(notif.id);
    }
    if (notif.postId) {
      setLocation('/community');
    } else if (notif.senderUid) {
      setLocation(`/profile/${notif.senderUid}`);
    }
  };

  const notifIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'like':
        return <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />;
      case 'comment':
        return <MessageSquare className="w-4 h-4 text-cyan-400" />;
      case 'follow':
        return <UserPlus className="w-4 h-4 text-emerald-400" />;
      case 'rank_change':
        return <Trophy className="w-4 h-4 text-amber-400" />;
      default:
        return <Bell className="w-4 h-4 text-primary" />;
    }
  };

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col max-w-2xl mx-auto pb-6 font-sans">
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl bg-background/95 backdrop-blur border-b border-border h-14 flex items-center justify-between px-4 z-40">
        <button
          onClick={() => setLocation('/profile')}
          className="text-muted-foreground hover:text-foreground transition-colors p-1 -ml-1 cursor-pointer"
          aria-label="Back to profile"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="font-semibold text-base text-foreground">Notifications & Activity</span>

        {unreadCount > 0 && (
          <button
            onClick={() => user && markAllNotificationsRead(user.uid)}
            className="text-xs font-mono text-primary font-bold hover:underline flex items-center gap-1 cursor-pointer"
          >
            <CheckCheck className="w-3.5 h-3.5" /> Mark All Read
          </button>
        )}
      </header>

      <main className="flex-1 overflow-y-auto px-4 pt-[72px] pb-4 space-y-5">
        {/* Social Notification Feed */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary" />
              <span>Community Alerts ({unreadCount} unread)</span>
            </h3>
          </div>

          {loadingNotifs ? (
            <div className="space-y-2">
              <div className="h-16 bg-card border border-border rounded-2xl animate-pulse" />
              <div className="h-16 bg-card border border-border rounded-2xl animate-pulse" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="bg-card/50 border border-border/80 rounded-2xl p-6 text-center text-xs font-mono text-muted-foreground">
              No recent notifications. Interact with traders on the Community tab!
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                    notif.read
                      ? 'bg-card/40 border-border/60 text-muted-foreground'
                      : 'bg-primary/10 border-primary/40 text-foreground font-medium shadow-2xs'
                  }`}
                >
                  <div className="w-9 h-9 rounded-full bg-secondary border border-border flex items-center justify-center shrink-0 mt-0.5">
                    {notifIcon(notif.type)}
                  </div>

                  <div className="flex-1 space-y-1">
                    <p className="text-xs sm:text-sm leading-snug">{notif.message}</p>
                    <p className="text-[10px] font-mono text-muted-foreground">
                      {notif.createdAt?.toDate ? notif.createdAt.toDate().toLocaleString() : 'Just now'}
                    </p>
                  </div>

                  {!notif.read && (
                    <span className="w-2.5 h-2.5 rounded-full bg-primary shrink-0 mt-2" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Preferences Section */}
        <div className="space-y-3 pt-4 border-t border-border/80">
          <h3 className="font-bold text-sm text-foreground">Notification Preferences</h3>
          {settingsLoading ? (
            <div className="h-16 bg-card border border-border rounded-xl animate-pulse" />
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3.5">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Bell className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Push Notifications</p>
                  <p className="text-[11px] text-muted-foreground">Trade fills, social replies, follower alerts</p>
                </div>
                <Switch
                  checked={settings?.pushNotificationsEnabled ?? true}
                  onCheckedChange={(checked) => updateSetting({ pushNotificationsEnabled: checked })}
                />
              </div>

              <div className="flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3.5">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Email Notifications</p>
                  <p className="text-[11px] text-muted-foreground">Weekly leaderboard digest & community highlights</p>
                </div>
                <Switch
                  checked={settings?.emailNotificationsEnabled ?? true}
                  onCheckedChange={(checked) => updateSetting({ emailNotificationsEnabled: checked })}
                />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

