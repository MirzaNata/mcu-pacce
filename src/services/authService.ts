import { supabase } from '../lib/supabaseClient';

export const authService = {
  /**
   * Login menggunakan Email & Password buatan Admin
   */
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  /**
   * Logout dari aplikasi (Mendukung nama signOut & logout agar tidak breaking error)
   */
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  logout: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  /**
   * Mengambil data pengguna yang sedang aktif (Synchronous & Async Friendly)
   */
  getCurrentUser: () => {
    // Ambil data user dari lokal atau metadata
    const userStr = localStorage.getItem('sb-mcu-user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        // Fallback
      }
    }
    return {
      name: 'Petugas IT / Admin MCU',
      role: 'ADMIN',
      email: 'admin@pakisaji.com',
    };
  },

  /**
   * Mengambil data user Supabase Auth secara async
   */
  getSupabaseUser: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Petugas IT / Admin MCU',
      role: user.user_metadata?.role || 'ADMIN',
    };
  },
};