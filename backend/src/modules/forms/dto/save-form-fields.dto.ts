import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsInt, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FormFieldDto {
  @ApiPropertyOptional({ example: 'field-uuid' })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({ example: 'text', description: 'Field element type (text, email, phone, select, radio, checkbox, file)' })
  @IsString()
  @IsNotEmpty()
  fieldType: string;

  @ApiProperty({ example: 'Full Name' })
  @IsString()
  @IsNotEmpty()
  label: string;

  @ApiPropertyOptional({ example: 'Enter your name...' })
  @IsString()
  @IsOptional()
  placeholder?: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  required?: boolean;

  @ApiProperty({ example: 0, description: 'Position order' })
  @IsInt()
  position: number;

  @ApiPropertyOptional({ example: { options: ['Option 1', 'Option 2'] } })
  @IsOptional()
  settingsJson?: any;
}

export class SaveFormFieldsDto {
  @ApiProperty({ type: [FormFieldDto], description: 'Full array of form field designs' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FormFieldDto)
  fields: FormFieldDto[];
}
