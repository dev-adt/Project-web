import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TemplatesService } from '../services/templates.service';
import { CreateTemplateDto } from '../dto/create-template.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RbacGuard } from '../../auth/guards/rbac.guard';
import { Permissions } from '../../auth/decorators/permissions.decorator';

@ApiTags('Landing Page Templates')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('templates')
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Get()
  @Permissions('pages.view')
  @ApiOperation({ summary: 'List all available landing page templates' })
  @ApiResponse({ status: 200, description: 'Templates list retrieved successfully' })
  async findAll() {
    return this.templatesService.findAll();
  }

  @Get(':id')
  @Permissions('pages.view')
  @ApiOperation({ summary: 'Get details of a single template' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.templatesService.findOne(id);
  }

  @Post()
  @Permissions('pages.create')
  @ApiOperation({ summary: 'Register a new landing page layout template' })
  @ApiResponse({ status: 201, description: 'Template created successfully' })
  async create(@Body() createTemplateDto: CreateTemplateDto) {
    return this.templatesService.create(createTemplateDto);
  }

  @Post(':id/create-page')
  @Permissions('pages.create')
  @ApiOperation({ summary: 'Instantiate a new page cloned from this template' })
  @ApiResponse({ status: 201, description: 'Page created successfully from template' })
  async createPage(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { title: string; slug: string },
  ) {
    return this.templatesService.createPageFromTemplate(id, body);
  }
}
