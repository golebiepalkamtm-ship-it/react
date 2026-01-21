import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';

export interface UserProfile {
  id: string;
  email?: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  role?: string;
  phone?: string;
  city?: string;
  street?: string;
  postal_code?: string;
  country?: string;
  created_at?: string;
}

export const userService = {
  async getProfile(userId: string): Promise<UserProfile | null> {
    try {
      if (!supabase) return null;
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) {
        logger.error('Error fetching user profile:', error);
        return null;
      }
      
      return data;
    } catch (error) {
      logger.error('Error in getProfile:', error);
      return null;
    }
  },

  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
      if (!supabase) return null;
      
      // Strip protected fields
      const safeUpdates = { ...updates };
      delete (safeUpdates as any).id;
      delete (safeUpdates as any).email;
      delete (safeUpdates as any).created_at;
      delete (safeUpdates as any).updated_at;
      
      const { data, error } = await supabase
        .from('users')
        .update(safeUpdates)
        .eq('id', userId)
        .select()
        .single();
        
      if (error) {
        logger.error('Error updating user profile:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      logger.error('Error in updateProfile:', error);
      throw error;
    }
  }
};
