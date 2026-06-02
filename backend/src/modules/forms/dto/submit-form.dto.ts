import { IsString, IsNotEmpty, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class SubmissionValueDto {
  @ApiProperty({ example: 'field-uuid' })
  @IsString()
  @IsNotEmpty()
  fieldId: string;

  @ApiProperty({ example: 'John Doe', description: 'Submitted field value' })
  @IsString()
  value: string;
}

export class SubmitFormDto {
  @ApiProperty({ type: [SubmissionValueDto], description: 'Dynamic list of field values' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubmissionValueDto)
  values: SubmissionValueDto[];
}
