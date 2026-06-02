import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { MediaFolderRepository } from '../repositories/media-folder.repository';
import { MediaFileRepository } from '../repositories/media-file.repository';
import { MinioService } from './minio.service';
import { CreateFolderDto } from '../dto/create-folder.dto';
import { MoveFileDto } from '../dto/move-file.dto';

@Injectable()
export class MediaService {
  constructor(
    private readonly folderRepository: MediaFolderRepository,
    private readonly fileRepository: MediaFileRepository,
    private readonly minioService: MinioService,
  ) {}

  // Folder Operations
  async createFolder(createFolderDto: CreateFolderDto) {
    if (createFolderDto.parentId) {
      const parent = await this.folderRepository.findById(createFolderDto.parentId);
      if (!parent) {
        throw new NotFoundException(`Parent folder with ID ${createFolderDto.parentId} not found.`);
      }
    }

    return this.folderRepository.create({
      name: createFolderDto.name,
      parentId: createFolderDto.parentId || null,
    });
  }

  async listFolders(parentId?: string) {
    const where: any = {};
    if (parentId) {
      where.parentId = parentId;
    } else {
      where.parentId = null;
    }
    return this.folderRepository.findMany({ where });
  }

  // File Operations
  async uploadFile(file: any, folderId?: string) {
    if (!file) {
      throw new BadRequestException('No file provided for upload.');
    }

    if (folderId) {
      const folder = await this.folderRepository.findById(folderId);
      if (!folder) {
        throw new NotFoundException(`Target folder with ID ${folderId} not found.`);
      }
    }

    // Upload object to MinIO S3 bucket
    const filePath = await this.minioService.uploadFile(
      file.originalname,
      file.buffer,
      file.mimetype,
    );

    // Save record parameters to local database
    return this.fileRepository.create({
      filename: file.originalname,
      filePath,
      mimeType: file.mimetype,
      fileSize: file.size,
      folderId: folderId || null,
      storageProvider: 'minio',
    });
  }

  async findFiles(folderId?: string, search?: string) {
    const where: any = {};
    
    if (folderId) {
      where.folderId = folderId;
    } else if (folderId === 'root') {
      where.folderId = null;
    }

    if (search) {
      where.filename = { contains: search, mode: 'insensitive' };
    }

    const { files } = await this.fileRepository.findMany({ where });
    return files;
  }

  async findOneFile(id: string) {
    const file = await this.fileRepository.findById(id);
    if (!file) {
      throw new NotFoundException(`File asset with ID ${id} not found.`);
    }
    return file;
  }

  async moveFile(id: string, moveFileDto: MoveFileDto) {
    await this.findOneFile(id);
    
    if (moveFileDto.folderId) {
      const folder = await this.folderRepository.findById(moveFileDto.folderId);
      if (!folder) {
        throw new NotFoundException(`Destination folder with ID ${moveFileDto.folderId} not found.`);
      }
    }

    return this.fileRepository.update(id, {
      folderId: moveFileDto.folderId || null,
    });
  }

  async deleteFile(id: string) {
    const file = await this.findOneFile(id);

    // Delete object physically from MinIO storage bucket
    await this.minioService.deleteFile(file.filePath);

    // Soft-delete database metadata record
    await this.fileRepository.softDelete(id);

    return { id, message: 'File asset deleted successfully.' };
  }
}
