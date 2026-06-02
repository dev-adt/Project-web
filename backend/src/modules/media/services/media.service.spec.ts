import { Test, TestingModule } from '@nestjs/testing';
import { MediaService } from './media.service';
import { MediaFolderRepository } from '../repositories/media-folder.repository';
import { MediaFileRepository } from '../repositories/media-file.repository';
import { MinioService } from './minio.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('MediaService', () => {
  let service: MediaService;
  let folderRepo: any;
  let fileRepo: any;
  let minioService: any;

  const mockFolder = {
    id: 'folder-uuid',
    name: 'Images',
    parentId: null,
  };

  const mockFile = {
    id: 'file-uuid',
    filename: 'photo.jpg',
    filePath: 'http://localhost/minio/media/123-photo.jpg',
    mimeType: 'image/jpeg',
    fileSize: 1024,
    folderId: 'folder-uuid',
  };

  const mockMediaFolderRepository = {
    findById: jest.fn().mockImplementation((id) => {
      if (id === 'folder-uuid') return Promise.resolve(mockFolder);
      return Promise.resolve(null);
    }),
    create: jest.fn().mockResolvedValue(mockFolder),
    findMany: jest.fn().mockResolvedValue([mockFolder]),
  };

  const mockMediaFileRepository = {
    findById: jest.fn().mockImplementation((id) => {
      if (id === 'file-uuid') return Promise.resolve(mockFile);
      return Promise.resolve(null);
    }),
    create: jest.fn().mockResolvedValue(mockFile),
    update: jest.fn().mockResolvedValue(mockFile),
    softDelete: jest.fn().mockResolvedValue(mockFile),
    findMany: jest.fn().mockResolvedValue({ files: [mockFile], total: 1 }),
  };

  const mockMinioService = {
    uploadFile: jest.fn().mockResolvedValue('http://localhost/minio/media/123-photo.jpg'),
    deleteFile: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MediaService,
        { provide: MediaFolderRepository, useValue: mockMediaFolderRepository },
        { provide: MediaFileRepository, useValue: mockMediaFileRepository },
        { provide: MinioService, useValue: mockMinioService },
      ],
    }).compile();

    service = module.get<MediaService>(MediaService);
    folderRepo = module.get<MediaFolderRepository>(MediaFolderRepository);
    fileRepo = module.get<MediaFileRepository>(MediaFileRepository);
    minioService = module.get<MinioService>(MinioService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createFolder', () => {
    it('should create root folder successfully', async () => {
      const res = await service.createFolder({ name: 'Root Folder' });
      expect(res).toBeDefined();
      expect(res.name).toBe('Images');
    });

    it('should throw NotFoundException if parentId is invalid', async () => {
      folderRepo.findById.mockResolvedValueOnce(null);
      await expect(
        service.createFolder({ name: 'Sub Folder', parentId: 'invalid-uuid' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('uploadFile', () => {
    it('should upload image buffer successfully', async () => {
      const mockMulterFile = {
        originalname: 'photo.jpg',
        buffer: Buffer.from('mock_bytes'),
        mimetype: 'image/jpeg',
        size: 1024,
      } as Express.Multer.File;

      const res = await service.uploadFile(mockMulterFile, 'folder-uuid');
      expect(res).toBeDefined();
      expect(res.filename).toBe('photo.jpg');
      expect(minioService.uploadFile).toHaveBeenCalled();
    });

    it('should throw BadRequestException if file missing', async () => {
      await expect(service.uploadFile(null as any)).rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteFile', () => {
    it('should delete S3 object and soft-delete db metadata', async () => {
      const res = await service.deleteFile('file-uuid');
      expect(res).toBeDefined();
      expect(minioService.deleteFile).toHaveBeenCalledWith(mockFile.filePath);
      expect(fileRepo.softDelete).toHaveBeenCalledWith('file-uuid');
    });
  });
});
