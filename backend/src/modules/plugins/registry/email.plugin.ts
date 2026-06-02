import { IPlugin } from '../interfaces/plugin.interface';
import { Logger } from '@nestjs/common';

export class EmailPlugin implements IPlugin {
  private readonly logger = new Logger('EmailPlugin');

  id: string = '';
  name: string = 'Tiếp thị & Tự động hóa Email';
  slug: string = 'email';
  version: string = '1.0.2';
  enabled: boolean = false;

  static getFieldDefinitions() {
    return [
      {
        key: 'provider',
        label: 'Nhà cung cấp Email',
        type: 'select',
        options: ['Mailchimp', 'SendGrid', 'ActiveCampaign'],
        defaultValue: 'Mailchimp',
        required: true,
      },
      {
        key: 'apiKey',
        label: 'API Key kết nối',
        type: 'password',
        placeholder: 'api-key-string-from-provider',
        defaultValue: '',
        required: true,
      },
      {
        key: 'listId',
        label: 'Mã danh sách nhận tin (List ID)',
        type: 'text',
        placeholder: 'audience-uuid-or-list-id',
        defaultValue: '',
        required: false,
      }
    ];
  }

  async init(): Promise<void> {
    this.logger.log('Starting Email Marketing mailing list queues...');
  }

  async destroy(): Promise<void> {
    this.logger.log('Destroying active Email integrations workers...');
  }
}
