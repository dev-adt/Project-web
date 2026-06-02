import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TrackViewDto {
  @ApiProperty({ example: 'home', description: 'Active slug of dynamic route' })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiPropertyOptional({ example: 'visitor-uuid-cookie' })
  @IsString()
  @IsOptional()
  visitorId?: string;

  @ApiPropertyOptional({ example: 'https://google.com' })
  @IsString()
  @IsOptional()
  referer?: string;
}
