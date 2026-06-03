import { IsString, IsOptional, IsArray, ValidateNested, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TemplateSectionDto {
  @ApiProperty({ description: 'Type of the section (e.g. Hero, Features, CTA)' })
  @IsString()
  sectionType: string;

  @ApiProperty({ description: 'Order position of the section in layout' })
  @IsInt()
  position: number;

  @ApiPropertyOptional({ description: 'Dynamic JSON configuration for the section settings' })
  @IsOptional()
  settingsJson?: any;
}

export class CreateTemplateDto {
  @ApiProperty({ description: 'Template display name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Detailed description of the template purpose' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Thumbnail image path' })
  @IsOptional()
  @IsString()
  thumbnail?: string;

  @ApiProperty({ type: [TemplateSectionDto], description: 'Layout sections pre-defined in the template' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TemplateSectionDto)
  sections: TemplateSectionDto[];
}
