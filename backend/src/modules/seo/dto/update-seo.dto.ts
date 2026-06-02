import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSeoDto {
  @ApiPropertyOptional({ example: 'SEO Meta Title' })
  @IsString()
  @IsOptional()
  metaTitle?: string;

  @ApiPropertyOptional({ example: 'SEO Meta Description' })
  @IsString()
  @IsOptional()
  metaDescription?: string;

  @ApiPropertyOptional({ example: 'keyword1, keyword2' })
  @IsString()
  @IsOptional()
  metaKeywords?: string;

  @ApiPropertyOptional({ example: 'OpenGraph Title' })
  @IsString()
  @IsOptional()
  ogTitle?: string;

  @ApiPropertyOptional({ example: 'OpenGraph Description' })
  @IsString()
  @IsOptional()
  ogDescription?: string;

  @ApiPropertyOptional({ example: 'https://example.com/image.jpg' })
  @IsString()
  @IsOptional()
  ogImage?: string;

  @ApiPropertyOptional({ example: 'https://example.com/canonical' })
  @IsString()
  @IsOptional()
  canonicalUrl?: string;

  @ApiPropertyOptional({ example: { '@context': 'https://schema.org', '@type': 'WebSite' } })
  @IsOptional()
  schemaJson?: any;
}
