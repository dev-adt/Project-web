import { IsArray, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignPermissionsDto {
  @ApiProperty({ example: [], description: 'List of permission UUIDs to assign to this role', type: [String] })
  @IsArray()
  @IsUUID('all', { each: true })
  permissionIds: string[];
}
