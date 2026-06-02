import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { Prisma, Category } from '@prisma/client';

@Injectable()
export class CategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Category | null> {
    return this.prisma.category.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });
  }

  async findBySlug(slug: string): Promise<Category | null> {
    return this.prisma.category.findFirst({
      where: {
        slug,
        deletedAt: null,
      },
    });
  }

  async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.CategoryWhereInput;
  }): Promise<{ categories: Category[]; total: number }> {
    const { skip, take, where } = params;
    const finalWhere = {
      ...where,
      deletedAt: null,
    };

    const [categories, total] = await Promise.all([
      this.prisma.category.findMany({
        skip,
        take,
        where: finalWhere,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.category.count({
        where: finalWhere,
      }),
    ]);

    return { categories, total };
  }

  async create(data: Prisma.CategoryCreateInput): Promise<Category> {
    return this.prisma.category.create({
      data,
    });
  }

  async update(id: string, data: Prisma.CategoryUpdateInput): Promise<Category> {
    return this.prisma.category.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: string): Promise<Category> {
    return this.prisma.category.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
