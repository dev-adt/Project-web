import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFolderDto {
  @ApiProperty({ example: 'Marketing Images', description: 'Name of the directory' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'parent-folder-uuid', description: 'Optional parent folder UUID for nested systems', required: false })
  @IsUUID('all')
  @IsOptional()
  parentId?: string;
}
