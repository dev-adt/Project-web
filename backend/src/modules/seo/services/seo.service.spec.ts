import { Test, TestingModule } from '@nestjs/testing';
import { SeoService } from './seo.service';
import { SeoRepository } from '../repositories/seo.repository';
import { NotFoundException } from '@nestjs/common';
import * as fs from 'fs';

describe('SeoService', () => {
  let service: SeoService;
  let seoRepo: any;

  const mockSeo = {
    id: 'seo-uuid',
    metaTitle: 'Main Title',
    metaDescription: 'Description description',
    metaKeywords: 'test, keywords',
    ogTitle: 'OG Title',
    ogDescription: 'OG Desc',
    ogImage: 'og.jpg',
    canonicalUrl: 'http://canonical',
    schemaJson: { type: 'WebSite' },
  };

  const mockSitemapData = {
    pages: [{ slug: 'home', updatedAt: new Date() }, { slug: 'landing', updatedAt: new Date() }],
    posts: [{ slug: 'blog-post', updatedAt: new Date() }],
  };

  const mockSeoRepository = {
    findSeoById: jest.fn().mockImplementation((id) => {
      if (id === 'seo-uuid') return Promise.resolve(mockSeo);
      return Promise.resolve(null);
    }),
    updateSeo: jest.fn().mockResolvedValue(mockSeo),
    getSitemapData: jest.fn().mockResolvedValue(mockSitemapData),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeoService,
        { provide: SeoRepository, useValue: mockSeoRepository },
      ],
    }).compile();

    service = module.get<SeoService>(SeoService);
    seoRepo = module.get<SeoRepository>(SeoRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getSitemap', () => {
    it('should aggregate dynamic published page and post link records', async () => {
      const res = await service.getSitemap();
      expect(res).toBeDefined();
      expect(res.links).toBeDefined();
      expect(res.links.length).toBe(3);
      expect(res.links[0].url).toContain('http://localhost');
    });
  });

  describe('getRobots', () => {
    it('should return standard default crawler rules', async () => {
      const res = await service.getRobots();
      expect(res).toBeDefined();
      expect(res.rules).toBeDefined();
      expect(res.rules[0].userAgent).toBe('*');
    });
  });

  describe('updateMetadata', () => {
    it('should modify an existing SEO metadata record', async () => {
      const res = await service.updateMetadata('seo-uuid', {
        metaTitle: 'Updated SEO Title',
      });

      expect(res).toBeDefined();
      expect(res.metaTitle).toBe('Main Title');
      expect(seoRepo.updateSeo).toHaveBeenCalled();
    });

    it('should throw NotFoundException if SEO ID does not exist', async () => {
      await expect(service.updateMetadata('invalid-uuid', { metaTitle: 'Fail' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
