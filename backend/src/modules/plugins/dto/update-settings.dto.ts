import { IsObject, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePluginSettingsDto {
  @ApiProperty({
    example: { apiKey: 'key-string', apiUrl: 'https://api-url.com' },
    description: 'Key-value map representing plugin custom settings properties',
  })
  @IsObject()
  @IsNotEmpty()
  settings: Record<string, string>;
}
