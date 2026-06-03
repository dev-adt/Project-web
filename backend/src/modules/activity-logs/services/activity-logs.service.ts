import { Injectable } from '@nestjs/common';
import { ActivityLogsRepository } from '../repositories/activity-logs.repository';

@Injectable()
export class ActivityLogsService {
  constructor(private readonly repository: ActivityLogsRepository) {}

  async logAction(params: {
    userId?: string;
    action: string;
    details: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return this.repository.create(params);
  }

  async findAll(params: {
    page: number;
    limit: number;
    userId?: string;
    action?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const { page, limit, userId, action, startDate, endDate } = params;
    const skip = (page - 1) * limit;

    const parsedStartDate = startDate ? new Date(startDate) : undefined;
    const parsedEndDate = endDate ? new Date(endDate) : undefined;

    const { logs, total } = await this.repository.findMany({
      skip,
      take: limit,
      userId,
      action,
      startDate: parsedStartDate,
      endDate: parsedEndDate,
    });

    return {
      logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
