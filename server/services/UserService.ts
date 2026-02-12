
import { prisma } from '../lib/db.js';
import { cache } from '../lib/cache.js';
import { Prisma } from '@prisma/client';

export class UserService {
  private static instance: UserService;

  private constructor() {}

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  /**
   * Safe delete user with transaction and verifications
   */
  async deleteUser(userId: string) {
    if (!prisma) throw new Error('Database connection failed');

    return await prisma.$transaction(async (tx) => {
      // 1. Check for active auctions where user is seller
      const activeAuctions = await tx.auction.count({
        where: {
          sellerId: userId,
          status: 'ACTIVE',
        },
      });

      if (activeAuctions > 0) {
        // Option: Cancel active auctions or throw error.
        // For fail-safe admin operation, we'll cancel them.
        await tx.auction.updateMany({
          where: {
            sellerId: userId,
            status: 'ACTIVE',
          },
          data: {
            status: 'CANCELLED',
            endTime: new Date(),
          },
        });
      }

      // 2. Check for active bids where user is highest bidder?
      // If we delete user, bids become anonymous (SetNull).
      // We might want to remove bids on active auctions to avoid ghost winners.
      const activeBids = await tx.bid.findMany({
        where: {
          bidderId: userId,
          auction: {
            status: 'ACTIVE',
          },
        },
        select: { id: true },
      });

      if (activeBids.length > 0) {
        // Delete bids on active auctions to prevent issues
        await tx.bid.deleteMany({
          where: {
            id: { in: activeBids.map((b) => b.id) },
          },
        });
      }

      // 3. Delete user
      // Relations with onDelete: Cascade (SavedSearch, Watchlist, etc.) will be deleted.
      // Relations with SetNull (Auctions, Bids, etc.) will be updated.
      const deletedUser = await tx.user.delete({
        where: { id: userId },
      });

      // 4. Invalidate cache
      cache.delete(`user:${userId}`);
      cache.deletePattern('users:*');
      cache.deletePattern('auctions:*'); // Since we might have cancelled auctions or deleted bids

      return deletedUser;
    });
  }

  /**
   * Update user with cache invalidation
   */
  async updateUser(userId: string, data: Prisma.UserUpdateInput) {
    if (!prisma) throw new Error('Database connection failed');

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data,
    });

    cache.delete(`user:${userId}`);
    cache.deletePattern('users:*');

    return updatedUser;
  }
}

export const userService = UserService.getInstance();
