import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from '../services/analytics.service';
import { TrackViewDto } from '../dto/track-view.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RbacGuard } from '../../auth/guards/rbac.guard';
import { Permissions } from '../../auth/decorators/permissions.decorator';
import { Public } from '../../../common/decorators/public.decorator';
import { Request } from 'express';

@ApiTags('Analytics & Metrics Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Public()
  @Post('track')
  @ApiOperation({ summary: 'Track a page view (Publicly accessible)' })
  @ApiResponse({ status: 201, description: 'Page view logged' })
  async track(@Body() trackViewDto: TrackViewDto, @Req() req: Request) {
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
    
    return this.analyticsService.track({
      slug: trackViewDto.slug,
      visitorId: trackViewDto.visitorId,
      referer: trackViewDto.referer,
      ipAddress,
      userAgent,
    });
  }

  @Get('overview')
  @Permissions('analytics.view')
  @ApiOperation({ summary: 'Retrieve dynamic metrics overview charts' })
  @ApiResponse({ status: 200, description: 'Sleek metrics aggregations' })
  async getOverview() {
    return this.analyticsService.getOverview();
  }
}
