import { supabase, isSupabaseConfigured } from '../supabase/client';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  avatar?: string;
}

export const authService = {
  async signUp(email: string, password: string, fullName: string) {
    if (!isSupabaseConfigured) {
      return { user: { id: 'local-admin', email, user_metadata: { full_name: fullName } }, error: null };
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) throw error;

    if (data.user) {
      await supabase.from('users').upsert({
        auth_id: data.user.id,
        email,
        full_name: fullName,
        role: 'Admin',
        status: 'Active',
      });
    }

    return { user: data.user, session: data.session };
  },

  async signIn(email: string, password: string) {
    if (!isSupabaseConfigured) {
      return { user: { id: 'local-admin', email, user_metadata: { full_name: 'John Doe' } }, session: null };
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    if (data.user) {
      await supabase.from('users').update({ last_login: new Date().toISOString() }).eq('auth_id', data.user.id);
    }

    return { user: data.user, session: data.session };
  },

  async signOut() {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async resetPassword(email: string) {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  },

  async getCurrentUser() {
    if (!isSupabaseConfigured) {
      return { id: 'local-admin', email: 'john.doe@fleetcorp.com', user_metadata: { full_name: 'John Doe' } };
    }
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) return null;
    return user;
  },

  onAuthStateChange(callback: (user: any) => void) {
    if (!isSupabaseConfigured) return { unsubscribe: () => {} };
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user || null);
    });
    return subscription;
  }
};
