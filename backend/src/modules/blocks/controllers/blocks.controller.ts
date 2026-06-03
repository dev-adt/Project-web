import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BlocksService } from '../services/blocks.service';
import { CreateBlockDto } from '../dto/create-block.dto';
import { UpdateBlockDto } from '../dto/update-block.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RbacGuard } from '../../auth/guards/rbac.guard';
import { Permissions } from '../../auth/decorators/permissions.decorator';

@ApiTags('Reusable Blocks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('blocks')
export class BlocksController {
  constructor(private readonly blocksService: BlocksService) {}

  @Get()
  @Permissions('pages.view')
  @ApiOperation({ summary: 'List all global reusable blocks' })
  @ApiResponse({ status: 200, description: 'Blocks list retrieved successfully' })
  async findAll() {
    return this.blocksService.findAll();
  }

  @Get(':id')
  @Permissions('pages.view')
  @ApiOperation({ summary: 'Get details of a single reusable block' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.blocksService.findOne(id);
  }

  @Post()
  @Permissions('pages.edit')
  @ApiOperation({ summary: 'Create a new global reusable block' })
  @ApiResponse({ status: 201, description: 'Reusable block created successfully' })
  async create(@Body() createBlockDto: CreateBlockDto) {
    return this.blocksService.create(createBlockDto);
  }

  @Put(':id')
  @Permissions('pages.edit')
  @ApiOperation({ summary: 'Modify settings or name of a reusable block' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateBlockDto: UpdateBlockDto,
  ) {
    return this.blocksService.update(id, updateBlockDto);
  }

  @Delete(':id')
  @Permissions('pages.edit')
  @ApiOperation({ summary: 'Soft-delete a global reusable block' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.blocksService.remove(id);
  }
}
