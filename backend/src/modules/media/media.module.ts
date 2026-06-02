import { Module } from '@nestjs/common';
import { MediaService } from './services/media.service';
import { MinioService } from './services/minio.service';
import { MediaController } from './controllers/media.controller';
import { MediaFolderRepository } from './repositories/media-folder.repository';
import { MediaFileRepository } from './repositories/media-file.repository';

@Module({
  controllers: [MediaController],
  providers: [
    MediaService,
    MinioService,
    MediaFolderRepository,
    MediaFileRepository,
  ],
  exports: [
    MediaService,
    MinioService,
    MediaFolderRepository,
    MediaFileRepository,
  ],
})
export class MediaModule {}
