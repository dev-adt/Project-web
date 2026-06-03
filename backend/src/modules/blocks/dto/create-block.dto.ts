import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBlockDto {
  @ApiProperty({ description: 'Unique block identification name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Layout section type (e.g. Hero, Features, CTA)' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({ description: 'JSON structure containing block layout settings' })
  @IsNotEmpty()
  settingsJson: any;
}
