import { Module, Global } from '@nestjs/common';
import { RolesService } from './services/roles.service';
import { RolesController } from './controllers/roles.controller';
import { RoleRepository } from './repositories/role.repository';

@Global()
@Module({
  controllers: [RolesController],
  providers: [RolesService, RoleRepository],
  exports: [RolesService, RoleRepository],
})
export class RolesModule {}
