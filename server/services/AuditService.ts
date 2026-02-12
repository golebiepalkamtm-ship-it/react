
import { prisma } from '../lib/db.js';
import logger from '../lib/logger.js';

export interface AuditLogData {
  action: string;
  actorId: string;
  targetId?: string;
  targetType: 'USER' | 'AUCTION' | 'SYSTEM' | 'OTHER';
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export class AuditService {
  private static instance: AuditService;

  private constructor() {}

  public static getInstance(): AuditService {
    if (!AuditService.instance) {
      AuditService.instance = new AuditService();
    }
    return AuditService.instance;
  }

  /**
   * Log an admin action
   */
  async log(data: AuditLogData) {
    try {
      if (!prisma) {
        logger.warn('AuditService: Database not initialized, skipping log', data);
        return;
      }

      await prisma.auditLog.create({
        data: {
          action: data.action,
          actorId: data.actorId,
          targetId: data.targetId,
          targetType: data.targetType,
          details: data.details || {},
          ipAddress: data.ipAddress,
          userAgent: data.userAgent
        } as any // Cast to any because Prisma Client might not be regenerated yet
      });
    } catch (error) {
      // Falure to log audit should not break the main flow, but should be logged securely
      logger.error('AuditService: Failed to create audit log', { error, data });
    }
  }
}

export const auditService = AuditService.getInstance();
