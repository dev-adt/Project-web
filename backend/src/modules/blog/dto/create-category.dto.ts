import { IsString, IsNotEmpty, IsOptional, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Technology', description: 'Name of the category' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'technology', description: 'URL-friendly identifier' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9-]+$/, { message: 'Slug must be alphanumeric lowercase words joined by hyphens.' })
  slug: string;

  @ApiPropertyOptional({ example: 'Posts about programming and technology' })
  @IsString()
  @IsOptional()
  description?: string;
}
