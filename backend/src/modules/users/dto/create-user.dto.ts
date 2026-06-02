import { IsEmail, IsString, IsOptional, IsArray, IsUUID, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com', description: 'Unique email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'johndoe', description: 'Unique username', required: false })
  @IsString()
  @IsOptional()
  username?: string;

  @ApiProperty({ example: 'Password123', description: 'Login password', required: false })
  @IsString()
  @MinLength(8)
  @IsOptional()
  password?: string;

  @ApiProperty({ example: 'John Doe', description: 'Full name' })
  @IsString()
  fullName: string;

  @ApiProperty({ example: [], description: 'List of assigned role UUIDs', type: [String], required: false })
  @IsArray()
  @IsUUID('all', { each: true })
  @IsOptional()
  roleIds?: string[];
}
