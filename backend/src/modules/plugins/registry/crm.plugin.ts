import { IPlugin } from '../interfaces/plugin.interface';
import { Logger } from '@nestjs/common';

export class CrmPlugin implements IPlugin {
  private readonly logger = new Logger('CrmPlugin');

  id: string = '';
  name: string = 'Đồng bộ Dữ liệu CRM';
  slug: string = 'crm';
  version: string = '1.0.0';
  enabled: boolean = false;

  static getFieldDefinitions() {
    return [
      {
        key: 'crmProvider',
        label: 'Nhà cung cấp CRM',
        type: 'select',
        options: ['HubSpot', 'Salesforce', 'Custom Webhook'],
        defaultValue: 'HubSpot',
        required: true,
      },
      {
        key: 'webhookUrl',
        label: 'Đường dẫn Webhook đồng bộ',
        type: 'text',
        placeholder: 'https://your-crm-gateway.com/webhook',
        defaultValue: '',
        required: true,
      },
      {
        key: 'syncSecret',
        label: 'Khóa bảo mật đồng bộ (Secret Key)',
        type: 'password',
        placeholder: 'Enter token or client secret...',
        defaultValue: '',
        required: false,
      }
    ];
  }

  async init(): Promise<void> {
    this.logger.log('Registering CRM Leads webhooks listeners...');
  }

  async destroy(): Promise<void> {
    this.logger.log('Disabling CRM synchronization queue workers...');
  }
}
