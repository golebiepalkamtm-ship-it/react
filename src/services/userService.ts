import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';

export interface UserProfile {
  id: string;
  username: string;
  email: string | null;
  phone: string | null;
  name: string | null;
  first_name: string | null;
  last_name: string | null;
  street: string | null;
  postal_code: string | null;
  city: string | null;
  country: string | null;
  isBlocked: boolean;
  isBanned: boolean;
  blockedUntil: Date | null;
  bannedUntil: Date | null;
  trustScore: number;
  role: string;
  avatarUrl: string | null;
  stripeCustomerId?: string | null;
}

export const userService = {
  async getProfile(userId: string): Promise<UserProfile | null> {
    try {
      if (!supabase) return null;
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .eq('isBlocked', false)
        .eq('isBanned', false)
        .single();  // FIX: Użycie single() dla pojedynczego obiektu

      if (error || !data) {
        logger.error('Error fetching user profile', error);
        return null;
      }

      return data as UserProfile;
    } catch (error) {
      logger.error('Unexpected error in getProfile', error);
      return null;
    }
  },

  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
      if (!supabase) return null;
      
      const updatesWithTimestamp = {
        ...updates,
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('users')
        .update(updatesWithTimestamp)
        .eq('id', userId)
        .eq('isBlocked', false)
        .eq('isBanned', false);

      if (error || !data) {
        logger.error('Error updating user profile', error);
        return null;
      }

      return data[0] as UserProfile;  // FIX: Poprawne zwracanie zaktualizowanego profilu
    } catch (error) {
      logger.error('Unexpected error in updateProfile', error);
      return null;
    }
  }
};
