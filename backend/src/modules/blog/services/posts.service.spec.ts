import { Test, TestingModule } from '@nestjs/testing';
import { PostsService } from './posts.service';
import { PostRepository } from '../repositories/post.repository';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('PostsService', () => {
  let service: PostsService;
  let postRepo: any;

  const mockPost = {
    id: 'post-uuid',
    title: 'My First Post',
    slug: 'my-first-post',
    content: '<p>Content</p>',
    status: 'draft',
    seoId: 'seo-uuid',
    authorId: 'user-uuid',
    publishedAt: null,
  };

  const mockPostRepository = {
    findById: jest.fn().mockImplementation((id) => {
      if (id === 'post-uuid') return Promise.resolve(mockPost);
      return Promise.resolve(null);
    }),
    findBySlug: jest.fn().mockImplementation((slug) => {
      if (slug === 'my-first-post') return Promise.resolve(mockPost);
      return Promise.resolve(null);
    }),
    create: jest.fn().mockResolvedValue(mockPost),
    update: jest.fn().mockResolvedValue(mockPost),
    softDelete: jest.fn().mockResolvedValue(mockPost),
    findMany: jest.fn().mockResolvedValue({ posts: [mockPost], total: 1 }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        { provide: PostRepository, useValue: mockPostRepository },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
    postRepo = module.get<PostRepository>(PostRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new draft post', async () => {
      postRepo.findBySlug.mockResolvedValueOnce(null);
      const res = await service.create({
        title: 'New Post',
        slug: 'new-post',
        content: '<p>HTML</p>',
        categoryIds: [],
        tagIds: [],
      }, 'author-uuid');

      expect(res).toBeDefined();
      expect(res.slug).toBe('my-first-post');
      expect(postRepo.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if slug already exists', async () => {
      postRepo.findBySlug.mockResolvedValueOnce(mockPost);
      await expect(
        service.create({
          title: 'My First Post',
          slug: 'my-first-post',
          content: '<p>HTML</p>',
        }, 'author-uuid'),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findOne', () => {
    it('should retrieve a single post', async () => {
      const res = await service.findOne('post-uuid');
      expect(res).toBeDefined();
      expect(res.slug).toBe('my-first-post');
    });

    it('should throw NotFoundException if post is missing', async () => {
      await expect(service.findOne('invalid-uuid')).rejects.toThrow(NotFoundException);
    });
  });

  describe('publish', () => {
    it('should set post status to published', async () => {
      const res = await service.publish('post-uuid');
      expect(res).toBeDefined();
      expect(postRepo.update).toHaveBeenCalledWith('post-uuid', {
        data: expect.objectContaining({ status: 'published' }),
      });
    });
  });
});
