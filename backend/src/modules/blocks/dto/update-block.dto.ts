import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateBlockDto {
  @ApiPropertyOptional({ description: 'Unique block identification name' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Layout section type (e.g. Hero, Features, CTA)' })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiPropertyOptional({ description: 'JSON structure containing block layout settings' })
  @IsOptional()
  settingsJson?: any;
}
