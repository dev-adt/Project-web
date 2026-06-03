import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { ActivityLog, Prisma } from '@prisma/client';

@Injectable()
export class ActivityLogsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    userId?: string;
    action: string;
    details: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<ActivityLog> {
    return this.prisma.activityLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        details: data.details,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    });
  }

  async findMany(params: {
    skip?: number;
    take?: number;
    userId?: string;
    action?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<{ logs: (ActivityLog & { user: { email: string; username: string } | null })[]; total: number }> {
    const { skip, take, userId, action, startDate, endDate } = params;

    const where: Prisma.ActivityLogWhereInput = {};

    if (userId) {
      where.userId = userId;
    }

    if (action) {
      where.action = {
        contains: action,
        mode: 'insensitive',
      };
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = startDate;
      }
      if (endDate) {
        where.createdAt.lte = endDate;
      }
    }

    const [logs, total] = await Promise.all([
      this.prisma.activityLog.findMany({
        skip,
        take,
        where,
        include: {
          user: {
            select: {
              email: true,
              username: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.activityLog.count({
        where,
      }),
    ]);

    return { logs, total };
  }
}
