import { Module } from '@nestjs/common';
import { AnalyticsService } from './services/analytics.service';
import { AnalyticsController } from './controllers/analytics.controller';
import { AnalyticsRepository } from './repositories/analytics.repository';
import { PagesModule } from '../pages/pages.module';

@Module({
  imports: [PagesModule],
  controllers: [AnalyticsController],
  providers: [AnalyticsService, AnalyticsRepository],
  exports: [AnalyticsService, AnalyticsRepository],
})
export class AnalyticsModule {}
