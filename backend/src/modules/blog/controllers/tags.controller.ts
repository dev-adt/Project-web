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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TagsService } from '../services/tags.service';
import { CreateTagDto } from '../dto/create-tag.dto';
import { UpdateTagDto } from '../dto/update-tag.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RbacGuard } from '../../auth/guards/rbac.guard';
import { Permissions } from '../../auth/decorators/permissions.decorator';
import { Public } from '../../../common/decorators/public.decorator';

@ApiTags('Tags')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Post()
  @Permissions('tags.create')
  @ApiOperation({ summary: 'Create a new blog tag' })
  @ApiResponse({ status: 201, description: 'Tag successfully created' })
  async create(@Body() createTagDto: CreateTagDto) {
    return this.tagsService.create(createTagDto);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'List paginated tags (Publicly accessible)' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 50 })
  async findAll(@Query('page') page: string = '1', @Query('limit') limit: string = '50') {
    return this.tagsService.findAll(parseInt(page, 10), parseInt(limit, 10));
  }

  @Get(':id')
  @Permissions('tags.view')
  @ApiOperation({ summary: 'Get details of a single tag' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.tagsService.findOne(id);
  }

  @Put(':id')
  @Permissions('tags.edit')
  @ApiOperation({ summary: 'Modify a tag' })
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() updateTagDto: UpdateTagDto) {
    return this.tagsService.update(id, updateTagDto);
  }

  @Delete(':id')
  @Permissions('tags.delete')
  @ApiOperation({ summary: 'Soft-delete a tag' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.tagsService.remove(id);
  }
}
