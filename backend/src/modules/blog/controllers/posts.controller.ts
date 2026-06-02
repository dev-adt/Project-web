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
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PostsService } from '../services/posts.service';
import { CreatePostDto } from '../dto/create-post.dto';
import { UpdatePostDto } from '../dto/update-post.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RbacGuard } from '../../auth/guards/rbac.guard';
import { Permissions } from '../../auth/decorators/permissions.decorator';
import { Public } from '../../../common/decorators/public.decorator';

@ApiTags('Posts & Blog Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @Permissions('posts.create')
  @ApiOperation({ summary: 'Create a new blog post as draft' })
  @ApiResponse({ status: 201, description: 'Post successfully created' })
  async create(@Body() createPostDto: CreatePostDto, @Req() req: any) {
    const authorId = req.user?.id;
    return this.postsService.create(createPostDto, authorId);
  }

  @Get()
  @Permissions('posts.view')
  @ApiOperation({ summary: 'List all posts with pagination, search, and status filters' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'search', required: false, example: 'nest' })
  @ApiQuery({ name: 'status', required: false, example: 'draft' })
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiQuery({ name: 'tagId', required: false })
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('categoryId') categoryId?: string,
    @Query('tagId') tagId?: string,
  ) {
    return this.postsService.findAll({
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      search,
      status,
      categoryId,
      tagId,
    });
  }

  @Public()
  @Get('slug/:slug')
  @ApiOperation({ summary: 'Fetch a single post details by slug (Publicly accessible)' })
  @ApiResponse({ status: 200, description: 'Post details, SEO parameters, categories, tags' })
  @ApiResponse({ status: 404, description: 'Post slug not found' })
  async findBySlug(@Param('slug') slug: string) {
    return this.postsService.findBySlug(slug);
  }

  @Get(':id')
  @Permissions('posts.view')
  @ApiOperation({ summary: 'Get details of a single post' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.postsService.findOne(id);
  }

  @Put(':id')
  @Permissions('posts.edit')
  @ApiOperation({ summary: 'Modify an existing blog post or SEO parameters' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePostDto: UpdatePostDto,
    @Req() req: any,
  ) {
    const updaterId = req.user?.id;
    return this.postsService.update(id, updatePostDto, updaterId);
  }

  @Delete(':id')
  @Permissions('posts.delete')
  @ApiOperation({ summary: 'Soft-delete a blog post' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.postsService.remove(id);
  }

  @Post(':id/publish')
  @Permissions('posts.publish')
  @ApiOperation({ summary: 'Publish a draft blog post' })
  async publish(@Param('id', ParseUUIDPipe) id: string) {
    return this.postsService.publish(id);
  }
}
