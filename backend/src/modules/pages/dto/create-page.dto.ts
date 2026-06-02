import { IsString, IsNotEmpty, IsOptional, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePageDto {
  @ApiProperty({ example: 'Home Page', description: 'Visual title of landing page' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'home', description: 'URL matching slug (kebab-case, lowercase)' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9-]+$/, { message: 'Slug must be alphanumeric lowercase words joined by hyphens.' })
  slug: string;
}
