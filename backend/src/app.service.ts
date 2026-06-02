import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from './database/prisma.service';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(private readonly prisma: PrismaService) {}

  async checkHealth() {
    let dbStatus = 'down';
    try {
      // Execute raw simple query to verify database connection health
      await this.prisma.$queryRaw`SELECT 1`;
      dbStatus = 'up';
    } catch (error) {
      this.logger.error('Database health check failed:', error);
    }

    return {
      status: dbStatus === 'up' ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      services: {
        database: dbStatus,
      },
    };
  }
}
