import { Module, Global } from '@nestjs/common';
import { PermissionsService } from './services/permissions.service';
import { PermissionsController } from './controllers/permissions.controller';
import { PermissionRepository } from './repositories/permission.repository';

@Global()
@Module({
  controllers: [PermissionsController],
  providers: [PermissionsService, PermissionRepository],
  exports: [PermissionsService, PermissionRepository],
})
export class PermissionsModule {}
