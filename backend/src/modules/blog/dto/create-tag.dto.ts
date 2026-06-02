import { IsString, IsNotEmpty, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTagDto {
  @ApiProperty({ example: 'NestJS', description: 'Name of the tag' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'nestjs', description: 'URL-friendly identifier' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9-]+$/, { message: 'Slug must be alphanumeric lowercase words joined by hyphens.' })
  slug: string;
}
