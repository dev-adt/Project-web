import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { Prisma, Tag } from '@prisma/client';

@Injectable()
export class TagRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Tag | null> {
    return this.prisma.tag.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });
  }

  async findBySlug(slug: string): Promise<Tag | null> {
    return this.prisma.tag.findFirst({
      where: {
        slug,
        deletedAt: null,
      },
    });
  }

  async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.TagWhereInput;
  }): Promise<{ tags: Tag[]; total: number }> {
    const { skip, take, where } = params;
    const finalWhere = {
      ...where,
      deletedAt: null,
    };

    const [tags, total] = await Promise.all([
      this.prisma.tag.findMany({
        skip,
        take,
        where: finalWhere,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.tag.count({
        where: finalWhere,
      }),
    ]);

    return { tags, total };
  }

  async create(data: Prisma.TagCreateInput): Promise<Tag> {
    return this.prisma.tag.create({
      data,
    });
  }

  async update(id: string, data: Prisma.TagUpdateInput): Promise<Tag> {
    return this.prisma.tag.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: string): Promise<Tag> {
    return this.prisma.tag.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
