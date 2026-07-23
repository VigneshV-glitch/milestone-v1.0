import { supabase, isSupabaseConfigured } from '../supabase/client';

export const settingsService = {
  async getSettings<T>(key: string, defaultValue: T): Promise<T> {
    if (!isSupabaseConfigured) {
      const stored = localStorage.getItem(`tms_setting_${key}`);
      return stored ? JSON.parse(stored) : defaultValue;
    }

    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', key)
      .single();

    if (error || !data) {
      return defaultValue;
    }

    return data.value as T;
  },

  async updateSettings<T>(key: string, value: T): Promise<{ success: boolean; error?: string }> {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('settings').upsert({
        key,
        value,
        updated_at: new Date().toISOString(),
      });

      if (error) return { success: false, error: error.message };
    }

    localStorage.setItem(`tms_setting_${key}`, JSON.stringify(value));
    return { success: true };
  }
};
