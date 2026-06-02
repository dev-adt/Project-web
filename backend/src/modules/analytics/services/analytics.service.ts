import { Injectable } from '@nestjs/common';
import { AnalyticsRepository } from '../repositories/analytics.repository';
import { PageRepository } from '../../pages/repositories/page.repository';

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly analyticsRepository: AnalyticsRepository,
    private readonly pageRepository: PageRepository,
  ) {}

  async track(params: {
    slug: string;
    visitorId?: string;
    ipAddress?: string;
    userAgent?: string;
    referer?: string;
  }) {
    let pageId: string | undefined;

    // Resolve page UUID from slug name
    if (params.slug) {
      const page = await this.pageRepository.findBySlug(params.slug);
      if (page) {
        pageId = page.id;
      }
    }

    return this.analyticsRepository.trackView({
      pageId,
      visitorId: params.visitorId,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      referer: params.referer,
    });
  }

  async getOverview() {
    const [views, leads, topPagesRaw, sources, daily] = await Promise.all([
      this.analyticsRepository.getPageViewCount(),
      this.analyticsRepository.getLeadCount(),
      this.analyticsRepository.getTopPages(),
      this.analyticsRepository.getTrafficSources(),
      this.analyticsRepository.getDailyViewsAndLeads(),
    ]);

    // Compute conversion rate
    const conversionRate = views > 0 ? Number(((leads / views) * 100).toFixed(1)) : 0;

    // Resolve top page titles
    const topPagesResolved = await Promise.all(
      topPagesRaw.map(async (item) => {
        let title = 'Trang ẩn danh';
        let slug = 'unknown';

        if (item.pageId) {
          const page = await this.pageRepository.findById(item.pageId);
          if (page) {
            title = page.title;
            slug = page.slug;
          }
        }

        return {
          title,
          slug,
          count: item.count,
        };
      }),
    );

    return {
      totalViews: views,
      totalLeads: leads,
      conversionRate,
      topPages: topPagesResolved,
      trafficSources: sources,
      dailyStats: daily,
    };
  }
}
