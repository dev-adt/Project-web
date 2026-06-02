import { Injectable, OnModuleInit, NotFoundException, Logger } from '@nestjs/common';
import { PluginsRepository } from '../repositories/plugins.repository';
import { IPlugin } from '../interfaces/plugin.interface';
import { DifyPlugin } from '../registry/dify.plugin';
import { CrmPlugin } from '../registry/crm.plugin';
import { EmailPlugin } from '../registry/email.plugin';

@Injectable()
export class PluginsService implements OnModuleInit {
  private readonly logger = new Logger('PluginsService');
  
  // Mapping of active plugin instances currently initialized in-memory
  private readonly activePlugins = new Map<string, IPlugin>();

  // Map slugs to their concrete classes for dynamic instantiations
  private readonly pluginRegistryClasses: Record<string, any> = {
    dify: DifyPlugin,
    crm: CrmPlugin,
    email: EmailPlugin,
  };

  constructor(private readonly pluginsRepository: PluginsRepository) {}

  async onModuleInit() {
    this.logger.log('Starting Plugins System Loader & Registry...');
    
    // 1. Seed dynamic registry plugins into database if they do not exist
    await this.seedRegistryPlugins();

    // 2. Load and initialize all plugins flagged as enabled in database
    await this.loadEnabledPlugins();
  }

  private async seedRegistryPlugins() {
    const seedData = [
      {
        slug: 'dify',
        name: 'Trợ lý AI (Dify)',
        description: 'Tích hợp chatbot thông minh AI và trợ lý ảo Dify trực tiếp lên landing page để hỗ trợ tư vấn khách hàng tự động 24/7.',
        version: '1.1.0',
      },
      {
        slug: 'crm',
        name: 'Đồng bộ Dữ liệu CRM',
        description: 'Tự động gửi thông tin liên hệ của khách hàng tiềm năng về hệ thống HubSpot, Salesforce hoặc webhook tùy chỉnh ngay khi họ nộp biểu mẫu.',
        version: '1.0.0',
      },
      {
        slug: 'email',
        name: 'Tiếp thị Email Marketing',
        description: 'Đồng bộ danh sách đăng ký nhận tin của khách hàng vào các phễu tiếp thị Mailchimp, SendGrid hoặc ActiveCampaign.',
        version: '1.0.2',
      },
    ];

    for (const data of seedData) {
      await this.pluginsRepository.upsertPlugin({
        slug: data.slug,
        name: data.name,
        description: data.description,
        version: data.version,
      });
    }

    this.logger.log('Registry base plugins seeded successfully.');
  }

  private async loadEnabledPlugins() {
    const allDbPlugins = await this.pluginsRepository.findAll();
    const enabledDbPlugins = allDbPlugins.filter((p) => p.enabled);

    for (const dbPlugin of enabledDbPlugins) {
      try {
        const PluginClass = this.pluginRegistryClasses[dbPlugin.slug];
        if (PluginClass) {
          const instance: IPlugin = new PluginClass();
          instance.id = dbPlugin.id;
          instance.enabled = true;
          
          await instance.init();
          this.activePlugins.set(dbPlugin.id, instance);
          
          this.logger.log(`Plugin loaded & initialized successfully: ${dbPlugin.name} (${dbPlugin.slug})`);
        }
      } catch (err) {
        this.logger.error(`Failed to initialize enabled plugin ${dbPlugin.slug}:`, err);
      }
    }
  }

  async getPlugins() {
    const dbPlugins = await this.pluginsRepository.findAll();
    
    // Enrich DB records with field definitions to enable dynamic form building on clients
    return dbPlugins.map((dbPlugin) => {
      const PluginClass = this.pluginRegistryClasses[dbPlugin.slug];
      const fields = PluginClass ? PluginClass.getFieldDefinitions() : [];
      
      return {
        id: dbPlugin.id,
        slug: dbPlugin.slug,
        name: dbPlugin.name,
        description: dbPlugin.description,
        version: dbPlugin.version,
        enabled: dbPlugin.enabled,
        fields,
      };
    });
  }

  async enablePlugin(id: string) {
    const dbPlugin = await this.pluginsRepository.findById(id);
    if (!dbPlugin) {
      throw new NotFoundException('Plugin không tồn tại.');
    }

    if (dbPlugin.enabled) {
      return dbPlugin;
    }

    // Update database flag
    const updated = await this.pluginsRepository.setEnabled(id, true);

    // Instantiate and trigger lifecycle hooks
    try {
      const PluginClass = this.pluginRegistryClasses[dbPlugin.slug];
      if (PluginClass && !this.activePlugins.has(id)) {
        const instance: IPlugin = new PluginClass();
        instance.id = id;
        instance.enabled = true;

        await instance.init();
        this.activePlugins.set(id, instance);
      }
    } catch (err) {
      this.logger.error(`Error activating plugin ${dbPlugin.slug}:`, err);
    }

    return updated;
  }

  async disablePlugin(id: string) {
    const dbPlugin = await this.pluginsRepository.findById(id);
    if (!dbPlugin) {
      throw new NotFoundException('Plugin không tồn tại.');
    }

    if (!dbPlugin.enabled) {
      return dbPlugin;
    }

    // Update database flag
    const updated = await this.pluginsRepository.setEnabled(id, false);

    // Call destroy lifecycle hook and remove active mapping
    const instance = this.activePlugins.get(id);
    if (instance) {
      try {
        await instance.destroy();
      } catch (err) {
        this.logger.error(`Error destroying plugin ${dbPlugin.slug}:`, err);
      }
      this.activePlugins.delete(id);
    }

    return updated;
  }

  async getPluginSettings(id: string) {
    const dbPlugin = await this.pluginsRepository.findById(id);
    if (!dbPlugin) {
      throw new NotFoundException('Plugin không tồn tại.');
    }

    const settingsRows = await this.pluginsRepository.getSettings(id);
    const settingsMap: Record<string, string> = {};
    
    settingsRows.forEach((row) => {
      settingsMap[row.key] = row.value;
    });

    return settingsMap;
  }

  async updatePluginSettings(id: string, settings: Record<string, string>) {
    const dbPlugin = await this.pluginsRepository.findById(id);
    if (!dbPlugin) {
      throw new NotFoundException('Plugin không tồn tại.');
    }

    await this.pluginsRepository.updateSettings(id, settings);
    return { success: true };
  }
}
