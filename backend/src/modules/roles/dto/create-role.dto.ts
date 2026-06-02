import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({ example: 'SUPPORT', description: 'Unique role name' })
  @IsString()
  @MaxLength(50)
  name: string;

  @ApiProperty({ example: 'Customer support agent', description: 'Brief description', required: false })
  @IsString()
  @IsOptional()
  description?: string;
}
