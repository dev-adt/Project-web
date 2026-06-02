import { Module } from '@nestjs/common';
import { PostsService } from './services/posts.service';
import { CategoriesService } from './services/categories.service';
import { TagsService } from './services/tags.service';
import { PostsController } from './controllers/posts.controller';
import { CategoriesController } from './controllers/categories.controller';
import { TagsController } from './controllers/tags.controller';
import { PostRepository } from './repositories/post.repository';
import { CategoryRepository } from './repositories/category.repository';
import { TagRepository } from './repositories/tag.repository';

@Module({
  controllers: [PostsController, CategoriesController, TagsController],
  providers: [
    PostsService,
    CategoriesService,
    TagsService,
    PostRepository,
    CategoryRepository,
    TagRepository,
  ],
  exports: [
    PostsService,
    CategoriesService,
    TagsService,
    PostRepository,
    CategoryRepository,
    TagRepository,
  ],
})
export class BlogModule {}
