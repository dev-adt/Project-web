import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ActivityLogsController } from './controllers/activity-logs.controller';
import { ActivityLogsService } from './services/activity-logs.service';
import { ActivityLogsRepository } from './repositories/activity-logs.repository';
import { ActivityLogInterceptor } from './interceptors/activity-log.interceptor';

@Module({
  controllers: [ActivityLogsController],
  providers: [
    ActivityLogsService,
    ActivityLogsRepository,
    {
      provide: APP_INTERCEPTOR,
      useClass: ActivityLogInterceptor,
    },
  ],
  exports: [ActivityLogsService],
})
export class ActivityLogsModule {}
