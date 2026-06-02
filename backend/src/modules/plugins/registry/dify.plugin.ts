import { IPlugin } from '../interfaces/plugin.interface';
import { Logger } from '@nestjs/common';

export class DifyPlugin implements IPlugin {
  private readonly logger = new Logger('DifyPlugin');
  
  id: string = '';
  name: string = 'Tích hợp Trợ lý AI (Dify)';
  slug: string = 'dify';
  version: string = '1.1.0';
  enabled: boolean = false;

  // Metadata describing options settings structure for dynamic client-side forms rendering
  static getFieldDefinitions() {
    return [
      {
        key: 'apiUrl',
        label: 'Dify API URL',
        type: 'text',
        placeholder: 'https://api.dify.ai/v1',
        defaultValue: 'https://api.dify.ai/v1',
        required: true,
      },
      {
        key: 'apiKey',
        label: 'Dify Client API Key',
        type: 'password',
        placeholder: 'app-xxxxxxxxxxxxxxxxxxxxxxxx',
        defaultValue: '',
        required: true,
      },
      {
        key: 'agentId',
        label: 'Chatbot Agent ID',
        type: 'text',
        placeholder: 'agent-uuid-string',
        defaultValue: '',
        required: false,
      }
    ];
  }

  async init(): Promise<void> {
    this.logger.log('Initializing Dify AI Assistant client instances...');
    // Real plugins would establish API clients, listeners, or middleware here
  }

  async destroy(): Promise<void> {
    this.logger.log('Destroying active Dify connection instances...');
    // Cleanups here
  }
}
