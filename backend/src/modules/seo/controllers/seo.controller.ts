import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SeoService } from '../services/seo.service';
import { UpdateSeoDto } from '../dto/update-seo.dto';
import { UpdateRobotsDto } from '../dto/update-robots.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RbacGuard } from '../../auth/guards/rbac.guard';
import { Permissions } from '../../auth/decorators/permissions.decorator';
import { Public } from '../../../common/decorators/public.decorator';

@ApiTags('SEO & Search Indexing Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('seo')
export class SeoController {
  constructor(private readonly seoService: SeoService) {}

  @Public()
  @Get('sitemap')
  @ApiOperation({ summary: 'Get dynamic sitemap links (Publicly accessible)' })
  @ApiResponse({ status: 200, description: 'Sitemap dynamic link listings' })
  async getSitemap() {
    return this.seoService.getSitemap();
  }

  @Public()
  @Get('robots')
  @ApiOperation({ summary: 'Get dynamic robots.txt settings (Publicly accessible)' })
  @ApiResponse({ status: 200, description: 'Robots rules configuration parameters' })
  async getRobots() {
    return this.seoService.getRobots();
  }

  @Put('robots')
  @Permissions('seo.edit')
  @ApiOperation({ summary: 'Modify standard robots.txt rule parameters' })
  async updateRobots(@Body() updateRobotsDto: UpdateRobotsDto) {
    return this.seoService.updateRobots(updateRobotsDto);
  }

  @Put('metadata/:id')
  @Permissions('seo.edit')
  @ApiOperation({ summary: 'Update standalone SEO metadata settings' })
  async updateMetadata(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSeoDto: UpdateSeoDto,
  ) {
    return this.seoService.updateMetadata(id, updateSeoDto);
  }
}
