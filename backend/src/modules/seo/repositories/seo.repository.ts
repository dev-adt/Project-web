import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { Prisma, SeoMetadata } from '@prisma/client';

@Injectable()
export class SeoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findSeoById(id: string): Promise<SeoMetadata | null> {
    return this.prisma.seoMetadata.findUnique({
      where: { id },
    });
  }

  async updateSeo(id: string, data: Prisma.SeoMetadataUpdateInput): Promise<SeoMetadata> {
    return this.prisma.seoMetadata.update({
      where: { id },
      data,
    });
  }

  async getSitemapData(): Promise<{ pages: any[]; posts: any[] }> {
    const [pages, posts] = await Promise.all([
      this.prisma.page.findMany({
        where: {
          status: 'published',
          deletedAt: null,
        },
        select: {
          slug: true,
          updatedAt: true,
        },
      }),
      this.prisma.post.findMany({
        where: {
          status: 'published',
          deletedAt: null,
        },
        select: {
          slug: true,
          updatedAt: true,
        },
      }),
    ]);

    return { pages, posts };
  }
}
