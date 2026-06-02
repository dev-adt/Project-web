import { IsString, IsOptional, IsInt, IsObject, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSectionDto {
  @ApiProperty({ example: 'features-modified', description: 'Block type key', required: false })
  @IsString()
  @IsOptional()
  sectionType?: string;

  @ApiProperty({ example: 2, description: 'Position order index', required: false })
  @IsInt()
  @IsOptional()
  position?: number;

  @ApiProperty({ example: {}, description: 'Properties configuration parameters', required: false })
  @IsObject()
  @IsOptional()
  settingsJson?: any;

  @ApiProperty({ example: false, description: 'Activation status', required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
