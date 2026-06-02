import { Test, TestingModule } from '@nestjs/testing';
import { PagesService } from './pages.service';
import { PageRepository } from '../repositories/page.repository';
import { PageSectionRepository } from '../repositories/page-section.repository';
import { PageVersionRepository } from '../repositories/page-version.repository';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('PagesService', () => {
  let service: PagesService;
  let pageRepo: any;
  let sectionRepo: any;
  let versionRepo: any;

  const mockPage = {
    id: 'page-uuid',
    title: 'Landing Page',
    slug: 'landing',
    status: 'draft',
  };

  const mockSection = {
    id: 'section-uuid',
    pageId: 'page-uuid',
    sectionType: 'hero',
    position: 0,
    settingsJson: { title: 'Hello' },
    isActive: true,
  };

  const mockVersion = {
    id: 'version-uuid',
    pageId: 'page-uuid',
    versionNumber: 1,
    layoutJson: { sections: [mockSection] },
  };

  const mockPageRepository = {
    findById: jest.fn().mockImplementation((id) => {
      if (id === 'page-uuid') return Promise.resolve(mockPage);
      return Promise.resolve(null);
    }),
    findBySlug: jest.fn().mockImplementation((slug) => {
      if (slug === 'landing') return Promise.resolve(mockPage);
      return Promise.resolve(null);
    }),
    create: jest.fn().mockResolvedValue(mockPage),
    update: jest.fn().mockResolvedValue(mockPage),
    softDelete: jest.fn().mockResolvedValue(mockPage),
    findMany: jest.fn().mockResolvedValue({ pages: [mockPage], total: 1 }),
  };

  const mockPageSectionRepository = {
    findById: jest.fn().mockImplementation((id) => {
      if (id === 'section-uuid') return Promise.resolve(mockSection);
      return Promise.resolve(null);
    }),
    findManyByPageId: jest.fn().mockResolvedValue([mockSection]),
    create: jest.fn().mockResolvedValue(mockSection),
    update: jest.fn().mockResolvedValue(mockSection),
    delete: jest.fn().mockResolvedValue(mockSection),
    replaceLayout: jest.fn().mockResolvedValue(undefined),
    reorder: jest.fn().mockResolvedValue(undefined),
  };

  const mockPageVersionRepository = {
    findById: jest.fn().mockImplementation((id) => {
      if (id === 'version-uuid') return Promise.resolve(mockVersion);
      return Promise.resolve(null);
    }),
    findManyByPageId: jest.fn().mockResolvedValue([mockVersion]),
    create: jest.fn().mockResolvedValue(mockVersion),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PagesService,
        { provide: PageRepository, useValue: mockPageRepository },
        { provide: PageSectionRepository, useValue: mockPageSectionRepository },
        { provide: PageVersionRepository, useValue: mockPageVersionRepository },
      ],
    }).compile();

    service = module.get<PagesService>(PagesService);
    pageRepo = module.get<PageRepository>(PageRepository);
    sectionRepo = module.get<PageSectionRepository>(PageSectionRepository);
    versionRepo = module.get<PageVersionRepository>(PageVersionRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new draft page', async () => {
      pageRepo.findBySlug.mockResolvedValueOnce(null);
      const res = await service.create({ title: 'New Page', slug: 'new-slug' });
      expect(res).toBeDefined();
      expect(res.slug).toBe('landing');
    });

    it('should throw ConflictException if slug already exists', async () => {
      pageRepo.findBySlug.mockResolvedValueOnce(mockPage);
      await expect(service.create({ title: 'Landing', slug: 'landing' })).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findOne', () => {
    it('should retrieve a single page profile details', async () => {
      const res = await service.findOne('page-uuid');
      expect(res).toBeDefined();
      expect(res.slug).toBe('landing');
    });

    it('should throw NotFoundException if page is missing', async () => {
      await expect(service.findOne('invalid-uuid')).rejects.toThrow(NotFoundException);
    });
  });

  describe('publish', () => {
    it('should publish a page, saving a layout snapshot version', async () => {
      const res = await service.publish('page-uuid', 'Custom publish note');
      expect(res).toBeDefined();
      expect(pageRepo.update).toHaveBeenCalledWith('page-uuid', { status: 'published' });
      expect(versionRepo.create).toHaveBeenCalled();
    });
  });

  describe('compareVersions', () => {
    it('should correctly calculate section additions, removals and modifications', async () => {
      // Mock sitemap collections for comparison
      const compareVer = {
        id: 'version-uuid',
        pageId: 'page-uuid',
        versionNumber: 2,
        layoutJson: {
          sections: [
            {
              id: 'section-uuid', // Present in base as well
              sectionType: 'hero',
              position: 0,
              settingsJson: { title: 'Changed Hello' }, // Modified settings
              isActive: true,
            },
            {
              id: 'new-section-uuid', // Added
              sectionType: 'features',
              position: 1,
              settingsJson: { title: 'Features' },
              isActive: true,
            }
          ]
        }
      };

      versionRepo.findById.mockResolvedValueOnce(compareVer);
      
      const res = await service.compareVersions('page-uuid', 'version-uuid', 'draft');
      expect(res).toBeDefined();
      expect(res.added.length).toBe(1);
      expect(res.modified.length).toBe(1);
      expect(res.removed.length).toBe(0);
      expect(res.added[0].id).toBe('new-section-uuid');
      expect(res.modified[0].id).toBe('section-uuid');
    });
  });
});
