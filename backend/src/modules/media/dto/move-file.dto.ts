import { IsUUID, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MoveFileDto {
  @ApiProperty({ example: 'target-folder-uuid', description: 'Destination folder UUID (null represents root)', required: false })
  @IsUUID('all')
  @IsOptional()
  folderId?: string;
}
