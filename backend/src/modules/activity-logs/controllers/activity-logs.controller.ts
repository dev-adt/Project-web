import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ActivityLogsService } from '../services/activity-logs.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RbacGuard } from '../../auth/guards/rbac.guard';
import { Permissions } from '../../auth/decorators/permissions.decorator';

@ApiTags('System Audit Activity Logs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('activity-logs')
export class ActivityLogsController {
  constructor(private readonly logsService: ActivityLogsService) {}

  @Get()
  @Permissions('users.edit') // Users edit is only granted to ADMIN role, securing logs access
  @ApiOperation({ summary: 'List paginated system audit trails and operator actions' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'action', required: false, example: 'page' })
  @ApiQuery({ name: 'startDate', required: false, example: '2026-06-01' })
  @ApiQuery({ name: 'endDate', required: false, example: '2026-06-30' })
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('userId') userId?: string,
    @Query('action') action?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.logsService.findAll({
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      userId,
      action,
      startDate,
      endDate,
    });
  }
}
