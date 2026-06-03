import { Module } from '@nestjs/common';
import { BlocksController } from './controllers/blocks.controller';
import { BlocksService } from './services/blocks.service';
import { BlocksRepository } from './repositories/blocks.repository';

@Module({
  controllers: [BlocksController],
  providers: [BlocksService, BlocksRepository],
  exports: [BlocksService],
})
export class BlocksModule {}
