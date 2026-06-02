import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateRoleDto {
  @ApiProperty({ example: 'SUPPORT', description: 'Unique role name', required: false })
  @IsString()
  @MaxLength(50)
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 'Customer support agent', description: 'Brief description', required: false })
  @IsString()
  @IsOptional()
  description?: string;
}
