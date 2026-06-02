import { IsString, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RobotsRuleDto {
  @ApiProperty({ example: '*' })
  @IsString()
  userAgent: string;

  @ApiProperty({ type: [String], example: ['/admin', '/api'] })
  @IsArray()
  @IsString({ each: true })
  disallow: string[];

  @ApiPropertyOptional({ type: [String], example: ['/public'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  allow?: string[];
}

export class UpdateRobotsDto {
  @ApiProperty({ type: [RobotsRuleDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RobotsRuleDto)
  rules: RobotsRuleDto[];

  @ApiPropertyOptional({ example: 'https://example.com/sitemap.xml' })
  @IsString()
  @IsOptional()
  sitemap?: string;
}
