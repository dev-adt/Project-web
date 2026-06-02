import { IsArray, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReorderSectionsDto {
  @ApiProperty({ example: [], description: 'List of section UUIDs sorted by position', type: [String] })
  @IsArray()
  @IsUUID('all', { each: true })
  sectionIds: string[];
}
