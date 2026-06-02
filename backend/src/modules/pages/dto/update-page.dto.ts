import { IsString, IsOptional, Matches, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePageDto {
  @ApiProperty({ example: 'Updated Home Page', description: 'Landing page title', required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ example: 'home-new', description: 'URL matching slug', required: false })
  @IsString()
  @IsOptional()
  @Matches(/^[a-z0-9-]+$/, { message: 'Slug must be alphanumeric lowercase words joined by hyphens.' })
  slug?: string;

  @ApiProperty({ example: 'published', description: 'Page state status (draft, published, archived)', required: false })
  @IsString()
  @IsIn(['draft', 'published', 'archived'])
  @IsOptional()
  status?: string;
}
