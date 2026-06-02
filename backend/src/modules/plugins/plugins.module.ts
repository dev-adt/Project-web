import { Module } from '@nestjs/common';
import { PluginsService } from './services/plugins.service';
import { PluginsController } from './controllers/plugins.controller';
import { PluginsRepository } from './repositories/plugins.repository';
import { PermissionsModule } from '../permissions/permissions.module';

@Module({
  imports: [PermissionsModule],
  controllers: [PluginsController],
  providers: [PluginsService, PluginsRepository],
  exports: [PluginsService, PluginsRepository],
})
export class PluginsModule {}
