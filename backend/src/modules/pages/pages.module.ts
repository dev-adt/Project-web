import { Module } from '@nestjs/common';
import { PagesService } from './services/pages.service';
import { PagesController } from './controllers/pages.controller';
import { PageRepository } from './repositories/page.repository';
import { PageSectionRepository } from './repositories/page-section.repository';
import { PageVersionRepository } from './repositories/page-version.repository';

@Module({
  controllers: [PagesController],
  providers: [
    PagesService,
    PageRepository,
    PageSectionRepository,
    PageVersionRepository,
  ],
  exports: [
    PagesService,
    PageRepository,
    PageSectionRepository,
    PageVersionRepository,
  ],
})
export class PagesModule {}
