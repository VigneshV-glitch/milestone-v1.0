import { supabase, isSupabaseConfigured } from '../supabase/client';

export interface Activity {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  user: string;
  timestamp: string;
}

export const activityService = {
  async getActivities(limit = 50): Promise<Activity[]> {
    if (!isSupabaseConfigured) {
      return JSON.parse(localStorage.getItem('tms_activities') || '[]');
    }

    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error || !data) {
      return JSON.parse(localStorage.getItem('tms_activities') || '[]');
    }

    return data.map((row) => ({
      id: row.id,
      message: row.message,
      type: row.type || 'info',
      user: row.user || 'Admin',
      timestamp: row.timestamp || new Date().toISOString(),
    }));
  },

  async logActivity(
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' = 'info',
    user: string = 'Admin'
  ) {
    const timestamp = new Date().toISOString();
    const id = `ACT-${Date.now()}`;

    if (isSupabaseConfigured) {
      await supabase.from('activities').insert({
        id,
        message,
        type,
        user,
        timestamp,
      });
    }

    const localActivities: Activity[] = JSON.parse(localStorage.getItem('tms_activities') || '[]');
    const newActivity: Activity = { id, message, type, user, timestamp };
    localStorage.setItem('tms_activities', JSON.stringify([newActivity, ...localActivities].slice(0, 50)));
    window.dispatchEvent(new Event('tms_data_changed'));
  },
};
