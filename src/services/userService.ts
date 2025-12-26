import { supabase } from '@/lib/supabase';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  avatar?: string;
  role: 'user' | 'admin';
  createdAt: string;
}

interface UpdateProfileData {
  name?: string;
  phone?: string;
  address?: string;
  avatar?: string;
}

export const userService = {
  async getProfile(): Promise<UserProfile> {
    if (!supabase) throw new Error('Supabase not configured');
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id;
    if (!userId) throw new Error('Authentication required');

    const { data, error } = await supabase.from('users').select('*').eq('id', userId).single();
    if (error) throw error;
    return data as UserProfile;
  },

  async updateProfile(data: UpdateProfileData): Promise<UserProfile> {
    if (!supabase) throw new Error('Supabase not configured');
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id;
    if (!userId) throw new Error('Authentication required');

    const { data: updated, error } = await supabase.from('users').update(data).eq('id', userId).select('*').single();
    if (error) throw error;
    return updated as UserProfile;
  },

  async getWatchlist(): Promise<any[]> {
    throw new Error('Watchlist API not implemented (Supabase-only cleanup).');
  },

  async addToWatchlist(auctionId: string): Promise<void> {
    throw new Error('Watchlist API not implemented (Supabase-only cleanup).');
  },

  async removeFromWatchlist(auctionId: string): Promise<void> {
    throw new Error('Watchlist API not implemented (Supabase-only cleanup).');
  },

  async getBidHistory(): Promise<any[]> {
    throw new Error('Bid history API not implemented (Supabase-only cleanup).');
  }
};