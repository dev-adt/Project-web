import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PluginsService } from '../services/plugins.service';
import { UpdatePluginSettingsDto } from '../dto/update-settings.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RbacGuard } from '../../auth/guards/rbac.guard';
import { Permissions } from '../../auth/decorators/permissions.decorator';

@ApiTags('Plugin Registry & Settings Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('plugins')
export class PluginsController {
  constructor(private readonly pluginsService: PluginsService) {}

  @Get()
  @Permissions('plugins.view')
  @ApiOperation({ summary: 'Get list of registered plugins with their settings configurations' })
  @ApiResponse({ status: 200, description: 'List of all system plugins returned successfully' })
  async getPlugins() {
    return this.pluginsService.getPlugins();
  }

  @Post(':id/enable')
  @Permissions('plugins.edit')
  @ApiOperation({ summary: 'Enable and initialize a registered plugin' })
  @ApiResponse({ status: 201, description: 'Plugin enabled successfully' })
  async enablePlugin(@Param('id', ParseUUIDPipe) id: string) {
    return this.pluginsService.enablePlugin(id);
  }

  @Post(':id/disable')
  @Permissions('plugins.edit')
  @ApiOperation({ summary: 'Disable and destroy an active plugin connection' })
  @ApiResponse({ status: 201, description: 'Plugin disabled successfully' })
  async disablePlugin(@Param('id', ParseUUIDPipe) id: string) {
    return this.pluginsService.disablePlugin(id);
  }

  @Get(':id/settings')
  @Permissions('plugins.view')
  @ApiOperation({ summary: 'Get current settings options dictionary of a specific plugin' })
  @ApiResponse({ status: 200, description: 'Settings key-value map returned successfully' })
  async getSettings(@Param('id', ParseUUIDPipe) id: string) {
    return this.pluginsService.getPluginSettings(id);
  }

  @Put(':id/settings')
  @Permissions('plugins.edit')
  @ApiOperation({ summary: 'Update customizable settings fields of a plugin' })
  @ApiResponse({ status: 200, description: 'Settings updated successfully' })
  async updateSettings(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePluginSettingsDto: UpdatePluginSettingsDto,
  ) {
    return this.pluginsService.updatePluginSettings(id, updatePluginSettingsDto.settings);
  }
}
