import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { PageView } from '@prisma/client';

@Injectable()
export class AnalyticsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async trackView(params: {
    pageId?: string;
    visitorId?: string;
    ipAddress?: string;
    userAgent?: string;
    referer?: string;
  }): Promise<PageView> {
    return this.prisma.pageView.create({
      data: params,
    });
  }

  async getPageViewCount(): Promise<number> {
    return this.prisma.pageView.count();
  }

  async getLeadCount(): Promise<number> {
    return this.prisma.formSubmission.count();
  }

  async getTopPages(): Promise<Array<{ pageId: string | null; count: number }>> {
    const raw = await this.prisma.pageView.groupBy({
      by: ['pageId'],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 10,
    });

    return raw.map((item) => ({
      pageId: item.pageId,
      count: item._count.id,
    }));
  }

  async getTrafficSources(): Promise<Record<string, number>> {
    const views = await this.prisma.pageView.findMany({
      select: {
        referer: true,
      },
    });

    const sources: Record<string, number> = {
      'Lưu lượng trực tiếp (Direct)': 0,
      'Tìm kiếm tự nhiên (Google)': 0,
      'Mạng xã hội (Facebook)': 0,
      'Nguồn giới thiệu (Referral)': 0,
    };

    views.forEach((view) => {
      const ref = view.referer?.toLowerCase() || '';
      if (!ref || ref.trim() === '') {
        sources['Lưu lượng trực tiếp (Direct)'] += 1;
      } else if (ref.includes('google.') || ref.includes('bing.') || ref.includes('yahoo.')) {
        sources['Tìm kiếm tự nhiên (Google)'] += 1;
      } else if (ref.includes('facebook.') || ref.includes('t.co') || ref.includes('twitter.') || ref.includes('linkedin.')) {
        sources['Mạng xã hội (Facebook)'] += 1;
      } else {
        sources['Nguồn giới thiệu (Referral)'] += 1;
      }
    });

    return sources;
  }

  async getDailyViewsAndLeads(): Promise<Array<{ date: string; views: number; leads: number }>> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [views, leads] = await Promise.all([
      this.prisma.pageView.findMany({
        where: {
          createdAt: {
            gte: sevenDaysAgo,
          },
        },
        select: {
          createdAt: true,
        },
      }),
      this.prisma.formSubmission.findMany({
        where: {
          submittedAt: {
            gte: sevenDaysAgo,
          },
        },
        select: {
          submittedAt: true,
        },
      }),
    ]);

    const dailyMap: Record<string, { views: number; leads: number }> = {};

    // Initialize map
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
      dailyMap[dateStr] = { views: 0, leads: 0 };
    }

    views.forEach((v) => {
      const dateStr = v.createdAt.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
      if (dailyMap[dateStr]) {
        dailyMap[dateStr].views += 1;
      }
    });

    leads.forEach((l) => {
      const dateStr = l.submittedAt.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
      if (dailyMap[dateStr]) {
        dailyMap[dateStr].leads += 1;
      }
    });

    return Object.entries(dailyMap).map(([date, val]) => ({
      date,
      views: val.views,
      leads: val.leads,
    }));
  }
}
