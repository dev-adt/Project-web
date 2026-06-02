import { IsEmail, IsString, IsOptional, IsArray, IsUUID, MinLength, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({ example: 'user@example.com', description: 'Email address', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: 'John Doe', description: 'Full name', required: false })
  @IsString()
  @IsOptional()
  fullName?: string;

  @ApiProperty({ example: 'Password123', description: 'New password', required: false })
  @IsString()
  @MinLength(8)
  @IsOptional()
  password?: string;

  @ApiProperty({ example: 'active', description: 'Account status (active, inactive, suspended)', required: false })
  @IsString()
  @IsIn(['active', 'inactive', 'suspended'])
  @IsOptional()
  status?: string;

  @ApiProperty({ example: [], description: 'List of assigned role UUIDs', type: [String], required: false })
  @IsArray()
  @IsUUID('all', { each: true })
  @IsOptional()
  roleIds?: string[];
}
