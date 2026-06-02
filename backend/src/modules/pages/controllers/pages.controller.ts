import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { PagesService } from '../services/pages.service';
import { CreatePageDto } from '../dto/create-page.dto';
import { UpdatePageDto } from '../dto/update-page.dto';
import { SaveLayoutDto } from '../dto/save-layout.dto';
import { CreateSectionDto } from '../dto/create-section.dto';
import { UpdateSectionDto } from '../dto/update-section.dto';
import { ReorderSectionsDto } from '../dto/reorder-sections.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RbacGuard } from '../../auth/guards/rbac.guard';
import { Permissions } from '../../auth/decorators/permissions.decorator';
import { Public } from '../../../common/decorators/public.decorator';

@ApiTags('Pages & Headless CMS')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('pages')
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Post()
  @Permissions('pages.create')
  @ApiOperation({ summary: 'Register a new landing page' })
  @ApiResponse({ status: 201, description: 'Page successfully registered' })
  async create(@Body() createPageDto: CreatePageDto) {
    return this.pagesService.create(createPageDto);
  }

  @Get()
  @Permissions('pages.view')
  @ApiOperation({ summary: 'List paginated landing pages' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiQuery({ name: 'status', required: false, example: 'published' })
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('status') status?: string,
  ) {
    return this.pagesService.findAll(parseInt(page, 10), parseInt(limit, 10), status);
  }

  // Public render route used by dynamic frontend
  @Public()
  @Get('slug/:slug')
  @ApiOperation({ summary: 'Public endpoint to fetch active page sections layout by slug' })
  @ApiResponse({ status: 200, description: 'Page details and layout sections' })
  @ApiResponse({ status: 404, description: 'Page slug not found' })
  async findBySlug(@Param('slug') slug: string) {
    return this.pagesService.findBySlug(slug);
  }

  @Get(':id')
  @Permissions('pages.view')
  @ApiOperation({ summary: 'Get details of a single page' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.pagesService.findOne(id);
  }

  @Put(':id')
  @Permissions('pages.edit')
  @ApiOperation({ summary: 'Modify page settings' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePageDto: UpdatePageDto,
  ) {
    return this.pagesService.update(id, updatePageDto);
  }

  @Delete(':id')
  @Permissions('pages.delete')
  @ApiOperation({ summary: 'Soft-delete a landing page' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.pagesService.remove(id);
  }

  @Post(':id/duplicate')
  @Permissions('pages.create')
  @ApiOperation({ summary: 'Duplicate an existing page and its layouts' })
  async duplicate(@Param('id', ParseUUIDPipe) id: string) {
    return this.pagesService.duplicate(id);
  }

  @Post(':id/publish')
  @Permissions('pages.publish')
  @ApiOperation({ summary: 'Mark status as published and save a layout version snapshot' })
  async publish(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('changeNote') changeNote?: string,
  ) {
    return this.pagesService.publish(id, changeNote);
  }

  @Post(':id/archive')
  @Permissions('pages.edit')
  @ApiOperation({ summary: 'Archive a page' })
  async archive(@Param('id', ParseUUIDPipe) id: string) {
    return this.pagesService.archive(id);
  }

  // Layout Builder Core APIs
  @Get(':id/layout')
  @Permissions('pages.view')
  @ApiOperation({ summary: 'Get layout sections of a page' })
  async getLayout(@Param('id', ParseUUIDPipe) id: string) {
    return this.pagesService.getLayout(id);
  }

  @Put(':id/layout')
  @Permissions('pages.edit')
  @ApiOperation({ summary: 'Overwrite complete layout sections' })
  async saveLayout(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() saveLayoutDto: SaveLayoutDto,
  ) {
    return this.pagesService.saveLayout(id, saveLayoutDto);
  }

  @Post(':id/sections')
  @Permissions('pages.edit')
  @ApiOperation({ summary: 'Append a new layout section block' })
  async addSection(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() createSectionDto: CreateSectionDto,
  ) {
    return this.pagesService.addSection(id, createSectionDto);
  }

  @Put(':id/sections/:sectionId')
  @Permissions('pages.edit')
  @ApiOperation({ summary: 'Edit layout section block properties' })
  async updateSection(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('sectionId', ParseUUIDPipe) sectionId: string,
    @Body() updateSectionDto: UpdateSectionDto,
  ) {
    return this.pagesService.updateSection(id, sectionId, updateSectionDto);
  }

  @Delete(':id/sections/:sectionId')
  @Permissions('pages.edit')
  @ApiOperation({ summary: 'Remove a layout section block' })
  async deleteSection(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('sectionId', ParseUUIDPipe) sectionId: string,
  ) {
    return this.pagesService.deleteSection(id, sectionId);
  }

  @Post(':id/sections/reorder')
  @Permissions('pages.edit')
  @ApiOperation({ summary: 'Reorder layouts by position list' })
  async reorderSections(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() reorderSectionsDto: ReorderSectionsDto,
  ) {
    return this.pagesService.reorderSections(id, reorderSectionsDto.sectionIds);
  }

  // Version Control APIs
  @Get(':id/versions')
  @Permissions('pages.view')
  @ApiOperation({ summary: 'List all page version snapshots' })
  async listVersions(@Param('id', ParseUUIDPipe) id: string) {
    return this.pagesService.listVersions(id);
  }

  @Get(':id/versions/:versionId')
  @Permissions('pages.view')
  @ApiOperation({ summary: 'Fetch a single page version layout snapshot' })
  async getVersion(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('versionId', ParseUUIDPipe) versionId: string,
  ) {
    return this.pagesService.getVersion(id, versionId);
  }

  @Post(':id/versions/:versionId/restore')
  @Permissions('pages.edit')
  @ApiOperation({ summary: 'Restore active layout from a version snapshot' })
  async restoreVersion(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('versionId', ParseUUIDPipe) versionId: string,
  ) {
    return this.pagesService.restoreVersion(id, versionId);
  }

  @Post(':id/versions/snapshot')
  @Permissions('pages.edit')
  @ApiOperation({ summary: 'Record manual version layout snapshot checkpoint' })
  async createSnapshot(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('changeNote') changeNote?: string,
  ) {
    return this.pagesService.createSnapshot(id, changeNote);
  }

  @Get(':id/versions/compare/:compareVersionId')
  @Permissions('pages.view')
  @ApiOperation({ summary: 'Compare page layout structural section differences' })
  @ApiQuery({ name: 'baseVersionId', required: false, description: 'Optional baseline version ID (defaults to current draft layout)' })
  async compareVersions(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('compareVersionId', ParseUUIDPipe) compareVersionId: string,
    @Query('baseVersionId') baseVersionId?: string,
  ) {
    return this.pagesService.compareVersions(id, compareVersionId, baseVersionId);
  }
}
