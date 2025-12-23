import apiClient from './api';
import { authService } from './authService';

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
    const token = authService.getToken();
    if (!token) throw new Error('Authentication required');
    
    return apiClient.get<UserProfile>('/users/profile');
  },

  async updateProfile(data: UpdateProfileData): Promise<UserProfile> {
    const token = authService.getToken();
    if (!token) throw new Error('Authentication required');
    
    return apiClient.put<UserProfile>('/users/profile', data, token);
  },

  async getWatchlist(): Promise<any[]> {
    const token = authService.getToken();
    if (!token) throw new Error('Authentication required');
    
    return apiClient.get<any[]>('/users/watchlist');
  },

  async addToWatchlist(auctionId: string): Promise<void> {
    const token = authService.getToken();
    if (!token) throw new Error('Authentication required');
    
    await apiClient.post(`/users/watchlist/${auctionId}`, {}, token);
  },

  async removeFromWatchlist(auctionId: string): Promise<void> {
    const token = authService.getToken();
    if (!token) throw new Error('Authentication required');
    
    await apiClient.delete(`/users/watchlist/${auctionId}`, token);
  },

  async getBidHistory(): Promise<any[]> {
    const token = authService.getToken();
    if (!token) throw new Error('Authentication required');
    
    return apiClient.get<any[]>('/users/bids');
  }
};