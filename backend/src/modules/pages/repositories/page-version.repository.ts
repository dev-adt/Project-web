import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { PageVersion } from '@prisma/client';

@Injectable()
export class PageVersionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<PageVersion | null> {
    return this.prisma.pageVersion.findUnique({
      where: { id },
    });
  }

  async findManyByPageId(pageId: string): Promise<PageVersion[]> {
    return this.prisma.pageVersion.findMany({
      where: { pageId },
      orderBy: { versionNumber: 'desc' },
    });
  }

  async create(pageId: string, layoutJson: any, changeNote?: string): Promise<PageVersion> {
    const nextVersion = await this.getNextVersionNumber(pageId);
    return this.prisma.pageVersion.create({
      data: {
        pageId,
        versionNumber: nextVersion,
        layoutJson: layoutJson || {},
        changeNote: changeNote || `Snapshot version ${nextVersion}`,
      },
    });
  }

  private async getNextVersionNumber(pageId: string): Promise<number> {
    const agg = await this.prisma.pageVersion.aggregate({
      where: { pageId },
      _max: { versionNumber: true },
    });
    return (agg._max.versionNumber || 0) + 1;
  }
}
