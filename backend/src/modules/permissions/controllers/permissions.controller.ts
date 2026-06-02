import { Controller, Get, UseGuards } from '@nestjs/common';
import { PermissionsService } from '../services/permissions.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RbacGuard } from '../../auth/guards/rbac.guard';
import { Permissions } from '../../auth/decorators/permissions.decorator';

@ApiTags('Permissions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  @Permissions('permissions.view')
  @ApiOperation({ summary: 'Get list of all system permissions' })
  @ApiResponse({ status: 200, description: 'Permissions list' })
  async findAll() {
    return this.permissionsService.findAll();
  }
}
