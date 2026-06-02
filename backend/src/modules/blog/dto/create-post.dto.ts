import { IsString, IsNotEmpty, IsOptional, IsArray, IsUUID, ValidateNested, Matches } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SeoMetadataDto } from './seo-metadata.dto';

export class CreatePostDto {
  @ApiProperty({ example: 'My First Blog Post', description: 'Headline of the blog post' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'my-first-blog-post', description: 'URL matching slug' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9-]+$/, { message: 'Slug must be alphanumeric lowercase words joined by hyphens.' })
  slug: string;

  @ApiPropertyOptional({ example: 'A short summary of this post.', description: 'Brief excerpt description' })
  @IsString()
  @IsOptional()
  excerpt?: string;

  @ApiProperty({ example: '<p>HTML content goes here</p>', description: 'Rich text block editor content' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({ example: 'uploads/banner.jpg', description: 'Featured banner image file path' })
  @IsString()
  @IsOptional()
  featuredImage?: string;

  @ApiPropertyOptional({ example: 'draft', enum: ['draft', 'review', 'published', 'archived'] })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ type: [String], description: 'List of associated category UUIDs' })
  @IsArray()
  @IsUUID('all', { each: true })
  @IsOptional()
  categoryIds?: string[];

  @ApiPropertyOptional({ type: [String], description: 'List of associated tag UUIDs' })
  @IsArray()
  @IsUUID('all', { each: true })
  @IsOptional()
  tagIds?: string[];

  @ApiPropertyOptional({ type: SeoMetadataDto, description: 'Optional SEO Metadata settings block' })
  @IsOptional()
  @ValidateNested()
  @Type(() => SeoMetadataDto)
  seo?: SeoMetadataDto;
}
