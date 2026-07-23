import { supabase, isSupabaseConfigured } from '../supabase/client';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
  timestamp: string;
}

export const notificationService = {
  async getNotifications(): Promise<NotificationItem[]> {
    if (!isSupabaseConfigured) {
      return JSON.parse(localStorage.getItem('tms_notifications') || '[]');
    }

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error || !data) return [];

    return data.map((n) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      type: n.type || 'info',
      read: Boolean(n.read),
      timestamp: n.timestamp,
    }));
  },

  async markAsRead(id: string) {
    if (isSupabaseConfigured) {
      await supabase.from('notifications').update({ read: true }).eq('id', id);
    }
  },

  async markAllAsRead() {
    if (isSupabaseConfigured) {
      await supabase.from('notifications').update({ read: true }).eq('read', false);
    }
  }
};
