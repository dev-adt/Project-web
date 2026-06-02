import { IsString, IsNotEmpty, IsOptional, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFormDto {
  @ApiProperty({ example: 'Contact Form', description: 'Name of the custom form builder' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'contact-form', description: 'URL matching slug (lowercase, kebab-case)' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9-]+$/, { message: 'Slug must be alphanumeric lowercase words joined by hyphens.' })
  slug: string;

  @ApiPropertyOptional({ example: 'Customer contact details gatherer form' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: { submitText: 'Send Message', successMessage: 'Thank you!' } })
  @IsOptional()
  settingsJson?: any;
}
