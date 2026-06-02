import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from './analytics.service';
import { AnalyticsRepository } from '../repositories/analytics.repository';
import { PageRepository } from '../../pages/repositories/page.repository';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let analyticsRepo: any;
  let pageRepo: any;

  const mockPage = {
    id: 'page-uuid-1',
    title: 'Trang Chủ',
    slug: 'home',
  };

  const mockPageView = {
    id: 'pageview-uuid-1',
    pageId: 'page-uuid-1',
    visitorId: 'visitor-1',
    ipAddress: '127.0.0.1',
    userAgent: 'Mozilla',
    referer: 'https://google.com',
    createdAt: new Date(),
  };

  const mockAnalyticsRepository = {
    trackView: jest.fn().mockResolvedValue(mockPageView),
    getPageViewCount: jest.fn().mockResolvedValue(100),
    getLeadCount: jest.fn().mockResolvedValue(5),
    getTopPages: jest.fn().mockResolvedValue([
      { pageId: 'page-uuid-1', count: 80 },
      { pageId: 'unknown-uuid', count: 20 },
    ]),
    getTrafficSources: jest.fn().mockResolvedValue({
      'Lưu lượng trực tiếp (Direct)': 40,
      'Tìm kiếm tự nhiên (Google)': 35,
      'Mạng xã hội (Facebook)': 15,
      'Nguồn giới thiệu (Referral)': 10,
    }),
    getDailyViewsAndLeads: jest.fn().mockResolvedValue([
      { date: '01/06', views: 50, leads: 2 },
      { date: '02/06', views: 50, leads: 3 },
    ]),
  };

  const mockPageRepository = {
    findBySlug: jest.fn().mockImplementation((slug) => {
      if (slug === 'home') return Promise.resolve(mockPage);
      return Promise.resolve(null);
    }),
    findById: jest.fn().mockImplementation((id) => {
      if (id === 'page-uuid-1') return Promise.resolve(mockPage);
      return Promise.resolve(null);
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        { provide: AnalyticsRepository, useValue: mockAnalyticsRepository },
        { provide: PageRepository, useValue: mockPageRepository },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
    analyticsRepo = module.get<AnalyticsRepository>(AnalyticsRepository);
    pageRepo = module.get<PageRepository>(PageRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('track', () => {
    it('should resolve page UUID from active slug and track the view', async () => {
      const res = await service.track({
        slug: 'home',
        visitorId: 'visitor-1',
        referer: 'https://google.com',
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla',
      });

      expect(res).toBeDefined();
      expect(res.pageId).toBe('page-uuid-1');
      expect(pageRepo.findBySlug).toHaveBeenCalledWith('home');
      expect(analyticsRepo.trackView).toHaveBeenCalledWith({
        pageId: 'page-uuid-1',
        visitorId: 'visitor-1',
        referer: 'https://google.com',
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla',
      });
    });

    it('should track view with pageId undefined when slug matches no page', async () => {
      const res = await service.track({
        slug: 'non-existing',
        visitorId: 'visitor-1',
        referer: 'https://google.com',
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla',
      });

      expect(pageRepo.findBySlug).toHaveBeenCalledWith('non-existing');
      expect(analyticsRepo.trackView).toHaveBeenCalled();
    });
  });

  describe('getOverview', () => {
    it('should aggregate views, leads, conversion rate, sources, dynamic logs and daily status', async () => {
      const overview = await service.getOverview();

      expect(overview).toBeDefined();
      expect(overview.totalViews).toBe(100);
      expect(overview.totalLeads).toBe(5);
      expect(overview.conversionRate).toBe(5); // (5 / 100) * 100
      expect(overview.trafficSources).toBeDefined();
      expect(overview.dailyStats).toBeDefined();
      expect(overview.topPages.length).toBe(2);

      // Verify resolved titles
      expect(overview.topPages[0].title).toBe('Trang Chủ');
      expect(overview.topPages[0].slug).toBe('home');
      expect(overview.topPages[0].count).toBe(80);

      expect(overview.topPages[1].title).toBe('Trang ẩn danh');
      expect(overview.topPages[1].slug).toBe('unknown');
      expect(overview.topPages[1].count).toBe(20);
    });

    it('should return 0 conversion rate when page views are zero', async () => {
      analyticsRepo.getPageViewCount.mockResolvedValueOnce(0);
      const overview = await service.getOverview();
      expect(overview.conversionRate).toBe(0);
    });
  });
});
