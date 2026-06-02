import { Module } from '@nestjs/common';
import { SeoService } from './services/seo.service';
import { SeoController } from './controllers/seo.controller';
import { SeoRepository } from './repositories/seo.repository';

@Module({
  controllers: [SeoController],
  providers: [SeoService, SeoRepository],
  exports: [SeoService, SeoRepository],
})
export class SeoModule {}
