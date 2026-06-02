import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { Prisma, Page } from '@prisma/client';

@Injectable()
export class PageRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Page | null> {
    return this.prisma.page.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        sections: {
          orderBy: { position: 'asc' },
        },
      },
    });
  }

  async findBySlug(slug: string): Promise<Page | null> {
    return this.prisma.page.findFirst({
      where: {
        slug,
        deletedAt: null,
      },
      include: {
        sections: {
          where: { isActive: true },
          orderBy: { position: 'asc' },
        },
      },
    });
  }

  async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.PageWhereInput;
  }): Promise<{ pages: Page[]; total: number }> {
    const { skip, take, where } = params;
    const finalWhere = {
      ...where,
      deletedAt: null,
    };

    const [pages, total] = await Promise.all([
      this.prisma.page.findMany({
        skip,
        take,
        where: finalWhere,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.page.count({
        where: finalWhere,
      }),
    ]);

    return { pages, total };
  }

  async create(data: Prisma.PageCreateInput): Promise<Page> {
    return this.prisma.page.create({
      data,
    });
  }

  async update(id: string, data: Prisma.PageUpdateInput): Promise<Page> {
    return this.prisma.page.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: string): Promise<Page> {
    return this.prisma.page.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
