import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseUUIDPipe,
  BadRequestException,
} from '@nestjs/common';
import { MediaService } from '../services/media.service';
import { CreateFolderDto } from '../dto/create-folder.dto';
import { MoveFileDto } from '../dto/move-file.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RbacGuard } from '../../auth/guards/rbac.guard';
import { Permissions } from '../../auth/decorators/permissions.decorator';

@ApiTags('Media Library')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  // Folders API
  @Post('folders')
  @Permissions('media.upload')
  @ApiOperation({ summary: 'Register a new media folder' })
  async createFolder(@Body() createFolderDto: CreateFolderDto) {
    return this.mediaService.createFolder(createFolderDto);
  }

  @Get('folders')
  @Permissions('media.view')
  @ApiOperation({ summary: 'List all folders' })
  @ApiQuery({ name: 'parentId', required: false })
  async listFolders(@Query('parentId') parentId?: string) {
    return this.mediaService.listFolders(parentId);
  }

  // Files API
  @Post('upload')
  @Permissions('media.upload')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 20 * 1024 * 1024, // 20MB maximum as per dev rules
      },
      fileFilter: (req, file, callback) => {
        const allowedMimeTypes = [
          'image/jpeg',
          'image/png',
          'image/webp',
          'image/svg+xml',
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
        ];
        if (!allowedMimeTypes.includes(file.mimetype)) {
          return callback(
            new BadRequestException(
              'Unsupported file extension. Only JPG, JPEG, PNG, WEBP, SVG, PDF, DOCX, and XLSX are allowed.',
            ),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload file asset to MinIO S3 object storage' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        folderId: { type: 'string', format: 'uuid', nullable: true },
      },
    },
  })
  async uploadFile(
    @UploadedFile() file: any,
    @Body('folderId') folderId?: string,
  ) {
    return this.mediaService.uploadFile(file, folderId);
  }

  @Get()
  @Permissions('media.view')
  @ApiOperation({ summary: 'Fetch list of files matching search keyword' })
  @ApiQuery({ name: 'folderId', required: false })
  @ApiQuery({ name: 'search', required: false })
  async findFiles(
    @Query('folderId') folderId?: string,
    @Query('search') search?: string,
  ) {
    return this.mediaService.findFiles(folderId, search);
  }

  @Get(':id')
  @Permissions('media.view')
  @ApiOperation({ summary: 'Get details metadata of a file' })
  async findOneFile(@Param('id', ParseUUIDPipe) id: string) {
    return this.mediaService.findOneFile(id);
  }

  @Post(':id/move')
  @Permissions('media.upload')
  @ApiOperation({ summary: 'Move file asset to destination folder' })
  async moveFile(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() moveFileDto: MoveFileDto,
  ) {
    return this.mediaService.moveFile(id, moveFileDto);
  }

  @Delete(':id')
  @Permissions('media.delete')
  @ApiOperation({ summary: 'Permanently remove asset from storage and databases' })
  async deleteFile(@Param('id', ParseUUIDPipe) id: string) {
    return this.mediaService.deleteFile(id);
  }
}
