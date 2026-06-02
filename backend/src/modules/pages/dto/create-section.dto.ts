import { IsString, IsNotEmpty, IsInt, IsObject, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSectionDto {
  @ApiProperty({ example: 'features', description: 'Block component key' })
  @IsString()
  @IsNotEmpty()
  sectionType: string;

  @ApiProperty({ example: 0, description: 'Position order index' })
  @IsInt()
  position: number;

  @ApiProperty({ example: {}, description: 'Properties configuration parameters' })
  @IsObject()
  settingsJson: any;

  @ApiProperty({ example: true, description: 'Activation status', required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
