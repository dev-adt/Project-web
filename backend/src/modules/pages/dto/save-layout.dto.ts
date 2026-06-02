import { IsArray, ValidateNested, IsString, IsInt, IsObject, IsOptional, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class SaveSectionItem {
  @ApiProperty({ example: 'hero', description: 'Type of block component' })
  @IsString()
  sectionType: string;

  @ApiProperty({ example: 0, description: 'Position order index' })
  @IsInt()
  position: number;

  @ApiProperty({ example: {}, description: 'Dynamic component properties settings JSON' })
  @IsObject()
  settingsJson: any;

  @ApiProperty({ example: true, description: 'Activation state', required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class SaveLayoutDto {
  @ApiProperty({ type: [SaveSectionItem], description: 'Layout sections array list' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaveSectionItem)
  sections: SaveSectionItem[];
}
