import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PostRepository } from '../repositories/post.repository';
import { CreatePostDto } from '../dto/create-post.dto';
import { UpdatePostDto } from '../dto/update-post.dto';

@Injectable()
export class PostsService {
  constructor(private readonly postRepository: PostRepository) {}

  async create(createPostDto: CreatePostDto, authorId?: string) {
    const existing = await this.postRepository.findBySlug(createPostDto.slug);
    if (existing) {
      throw new ConflictException(`Post slug ${createPostDto.slug} is already registered.`);
    }

    const { categoryIds, tagIds, seo, ...postData } = createPostDto;

    return this.postRepository.create({
      data: {
        title: postData.title,
        slug: postData.slug,
        excerpt: postData.excerpt,
        content: postData.content,
        featuredImage: postData.featuredImage,
        status: postData.status || 'draft',
        authorId,
        createdBy: authorId,
      },
      seo: seo
        ? {
            metaTitle: seo.metaTitle,
            metaDescription: seo.metaDescription,
            metaKeywords: seo.metaKeywords,
            ogTitle: seo.ogTitle,
            ogDescription: seo.ogDescription,
            ogImage: seo.ogImage,
            canonicalUrl: seo.canonicalUrl,
          }
        : undefined,
      categoryIds,
      tagIds,
    });
  }

  async findOne(id: string) {
    const post = await this.postRepository.findById(id);
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found.`);
    }
    return post;
  }

  async findBySlug(slug: string) {
    const post = await this.postRepository.findBySlug(slug);
    if (!post) {
      throw new NotFoundException(`Post with slug ${slug} not found.`);
    }
    return post;
  }

  async findAll(params: {
    page: number;
    limit: number;
    search?: string;
    status?: string;
    categoryId?: string;
    tagId?: string;
  }) {
    const { page, limit, search, status, categoryId, tagId } = params;
    const skip = (page - 1) * limit;

    const { posts, total } = await this.postRepository.findMany({
      skip,
      take: limit,
      search,
      status,
      categoryId,
      tagId,
    });

    return {
      posts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(id: string, updatePostDto: UpdatePostDto, updaterId?: string) {
    const post = await this.findOne(id);

    const { categoryIds, tagIds, seo, ...postData } = updatePostDto;

    const updateData: any = {
      updatedBy: updaterId,
    };

    if (postData.title !== undefined) {
      updateData.title = postData.title;
    }

    if (postData.slug && postData.slug !== post.slug) {
      const existing = await this.postRepository.findBySlug(postData.slug);
      if (existing) {
        throw new ConflictException(`Post slug ${postData.slug} is already in use.`);
      }
      updateData.slug = postData.slug;
    }

    if (postData.excerpt !== undefined) {
      updateData.excerpt = postData.excerpt;
    }

    if (postData.content !== undefined) {
      updateData.content = postData.content;
    }

    if (postData.featuredImage !== undefined) {
      updateData.featuredImage = postData.featuredImage;
    }

    if (postData.status !== undefined) {
      updateData.status = postData.status;
      if (postData.status === 'published' && !post.publishedAt) {
        updateData.publishedAt = new Date();
      }
    }

    const seoUpdate = seo
      ? {
          metaTitle: seo.metaTitle,
          metaDescription: seo.metaDescription,
          metaKeywords: seo.metaKeywords,
          ogTitle: seo.ogTitle,
          ogDescription: seo.ogDescription,
          ogImage: seo.ogImage,
          canonicalUrl: seo.canonicalUrl,
        }
      : undefined;

    return this.postRepository.update(id, {
      data: updateData,
      seo: seoUpdate,
      categoryIds,
      tagIds,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.postRepository.softDelete(id);
    return { id, message: 'Post soft deleted successfully.' };
  }

  async publish(id: string) {
    const post = await this.findOne(id);
    return this.postRepository.update(id, {
      data: {
        status: 'published',
        publishedAt: post.publishedAt || new Date(),
      },
    });
  }
}
