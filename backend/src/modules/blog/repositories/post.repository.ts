import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { Prisma, Post, SeoMetadata } from '@prisma/client';

@Injectable()
export class PostRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<(Post & { seo: SeoMetadata | null; categories: any[]; tags: any[] }) | null> {
    const post = await this.prisma.post.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        seo: true,
        postCategories: {
          include: {
            category: true,
          },
        },
        postTags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!post) return null;

    return {
      ...post,
      categories: post.postCategories.map((pc) => pc.category),
      tags: post.postTags.map((pt) => pt.tag),
    };
  }

  async findBySlug(slug: string): Promise<(Post & { seo: SeoMetadata | null; categories: any[]; tags: any[] }) | null> {
    const post = await this.prisma.post.findFirst({
      where: {
        slug,
        deletedAt: null,
      },
      include: {
        seo: true,
        postCategories: {
          include: {
            category: true,
          },
        },
        postTags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!post) return null;

    return {
      ...post,
      categories: post.postCategories.map((pc) => pc.category),
      tags: post.postTags.map((pt) => pt.tag),
    };
  }

  async findMany(params: {
    skip?: number;
    take?: number;
    search?: string;
    status?: string;
    categoryId?: string;
    tagId?: string;
  }): Promise<{ posts: any[]; total: number }> {
    const { skip, take, search, status, categoryId, tagId } = params;

    const where: Prisma.PostWhereInput = {
      deletedAt: null,
    };

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (categoryId) {
      where.postCategories = {
        some: {
          categoryId,
        },
      };
    }

    if (tagId) {
      where.postTags = {
        some: {
          tagId,
        },
      };
    }

    const [postsRaw, total] = await Promise.all([
      this.prisma.post.findMany({
        skip,
        take,
        where,
        include: {
          seo: true,
          postCategories: {
            include: {
              category: true,
            },
          },
          postTags: {
            include: {
              tag: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.post.count({
        where,
      }),
    ]);

    const posts = postsRaw.map((post) => ({
      ...post,
      categories: post.postCategories.map((pc) => pc.category),
      tags: post.postTags.map((pt) => pt.tag),
    }));

    return { posts, total };
  }

  async create(params: {
    data: Omit<Prisma.PostCreateInput, 'seo' | 'postCategories' | 'postTags'>;
    seo?: Omit<Prisma.SeoMetadataCreateInput, 'pages' | 'posts'>;
    categoryIds?: string[];
    tagIds?: string[];
  }): Promise<Post> {
    const { data, seo, categoryIds, tagIds } = params;

    return this.prisma.$transaction(async (tx) => {
      let seoId: string | undefined;

      if (seo) {
        const createdSeo = await tx.seoMetadata.create({
          data: seo,
        });
        seoId = createdSeo.id;
      }

      const post = await tx.post.create({
        data: {
          ...data,
          seoId,
        } as any,
      });

      if (categoryIds && categoryIds.length > 0) {
        await tx.postCategory.createMany({
          data: categoryIds.map((categoryId) => ({
            postId: post.id,
            categoryId,
          })),
        });
      }

      if (tagIds && tagIds.length > 0) {
        await tx.postTag.createMany({
          data: tagIds.map((tagId) => ({
            postId: post.id,
            tagId,
          })),
        });
      }

      return post;
    });
  }

  async update(
    id: string,
    params: {
      data: Partial<Omit<Prisma.PostUpdateInput, 'seo' | 'postCategories' | 'postTags'>>;
      seo?: Partial<Omit<Prisma.SeoMetadataUpdateInput, 'pages' | 'posts'>>;
      categoryIds?: string[];
      tagIds?: string[];
    },
  ): Promise<Post> {
    const { data, seo, categoryIds, tagIds } = params;

    return this.prisma.$transaction(async (tx) => {
      const existingPost = await tx.post.findUnique({
        where: { id },
        include: { seo: true },
      });

      if (!existingPost) {
        throw new Error(`Post with ID ${id} not found.`);
      }

      const updatePayload: any = { ...data };

      // Handle SEO metadata update
      if (seo) {
        if (existingPost.seoId) {
          await tx.seoMetadata.update({
            where: { id: existingPost.seoId },
            data: seo as any,
          });
        } else {
          const createdSeo = await tx.seoMetadata.create({
            data: seo as any,
          });
          updatePayload.seoId = createdSeo.id;
        }
      }

      // Update post fields
      const post = await tx.post.update({
        where: { id },
        data: updatePayload,
      });

      // Update Category relations
      if (categoryIds !== undefined) {
        await tx.postCategory.deleteMany({
          where: { postId: id },
        });

        if (categoryIds.length > 0) {
          await tx.postCategory.createMany({
            data: categoryIds.map((categoryId) => ({
              postId: id,
              categoryId,
            })),
          });
        }
      }

      // Update Tag relations
      if (tagIds !== undefined) {
        await tx.postTag.deleteMany({
          where: { postId: id },
        });

        if (tagIds.length > 0) {
          await tx.postTag.createMany({
            data: tagIds.map((tagId) => ({
              postId: id,
              tagId,
            })),
          });
        }
      }

      return post;
    });
  }

  async softDelete(id: string): Promise<Post> {
    return this.prisma.post.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
