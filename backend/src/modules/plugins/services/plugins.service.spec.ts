import { Test, TestingModule } from '@nestjs/testing';
import { PluginsService } from './plugins.service';
import { PluginsRepository } from '../repositories/plugins.repository';
import { NotFoundException } from '@nestjs/common';

describe('PluginsService', () => {
  let service: PluginsService;
  let pluginsRepo: any;

  const mockPlugin = {
    id: 'plugin-uuid-1',
    name: 'Trợ lý AI (Dify)',
    slug: 'dify',
    description: 'AI integration features',
    version: '1.1.0',
    enabled: false,
    settingsJson: {},
  };

  const mockSettingsRow = [
    { id: 'set-1', pluginId: 'plugin-uuid-1', key: 'apiUrl', value: 'https://api.dify.ai/v1' },
    { id: 'set-2', pluginId: 'plugin-uuid-1', key: 'apiKey', value: 'secret-key-123' },
  ];

  const mockPluginsRepository = {
    findAll: jest.fn().mockResolvedValue([mockPlugin]),
    findById: jest.fn().mockImplementation((id) => {
      if (id === 'plugin-uuid-1') return Promise.resolve(mockPlugin);
      return Promise.resolve(null);
    }),
    upsertPlugin: jest.fn().mockResolvedValue(mockPlugin),
    setEnabled: jest.fn().mockImplementation((id, enabled) => {
      return Promise.resolve({ ...mockPlugin, enabled });
    }),
    getSettings: jest.fn().mockResolvedValue(mockSettingsRow),
    updateSettings: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PluginsService,
        { provide: PluginsRepository, useValue: mockPluginsRepository },
      ],
    }).compile();

    service = module.get<PluginsService>(PluginsService);
    pluginsRepo = module.get<PluginsRepository>(PluginsRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should seed registry plugins and load enabled ones', async () => {
      await service.onModuleInit();
      expect(pluginsRepo.upsertPlugin).toHaveBeenCalledTimes(3); // Seed Dify, CRM, Email
      expect(pluginsRepo.findAll).toHaveBeenCalled();
    });
  });

  describe('getPlugins', () => {
    it('should enrich database plugins with field definitions', async () => {
      const plugins = await service.getPlugins();
      expect(plugins).toBeDefined();
      expect(plugins.length).toBe(1);
      expect(plugins[0].slug).toBe('dify');
      expect(plugins[0].fields).toBeDefined();
      expect(plugins[0].fields.length).toBe(3); // apiUrl, apiKey, agentId
      expect(plugins[0].fields[0].key).toBe('apiUrl');
    });
  });

  describe('enablePlugin', () => {
    it('should set enabled status to true and trigger init', async () => {
      const res = await service.enablePlugin('plugin-uuid-1');
      expect(res).toBeDefined();
      expect(res.enabled).toBe(true);
      expect(pluginsRepo.setEnabled).toHaveBeenCalledWith('plugin-uuid-1', true);
    });

    it('should throw NotFoundException if plugin does not exist', async () => {
      await expect(service.enablePlugin('invalid-uuid')).rejects.toThrow(NotFoundException);
    });
  });

  describe('disablePlugin', () => {
    it('should set enabled status to false and trigger destroy if active', async () => {
      // Mock plugin active state by enabling it first
      await service.enablePlugin('plugin-uuid-1');
      pluginsRepo.findById.mockResolvedValueOnce({ ...mockPlugin, enabled: true });

      const res = await service.disablePlugin('plugin-uuid-1');
      expect(res).toBeDefined();
      expect(res.enabled).toBe(false);
      expect(pluginsRepo.setEnabled).toHaveBeenCalledWith('plugin-uuid-1', false);
    });

    it('should throw NotFoundException if plugin does not exist', async () => {
      await expect(service.disablePlugin('invalid-uuid')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getPluginSettings', () => {
    it('should retrieve key-value maps of plugin settings', async () => {
      const settings = await service.getPluginSettings('plugin-uuid-1');
      expect(settings).toBeDefined();
      expect(settings['apiUrl']).toBe('https://api.dify.ai/v1');
      expect(settings['apiKey']).toBe('secret-key-123');
      expect(pluginsRepo.getSettings).toHaveBeenCalledWith('plugin-uuid-1');
    });
  });

  describe('updatePluginSettings', () => {
    it('should update key-values inside repository', async () => {
      const payload = { apiUrl: 'https://dify.custom.com/v1', apiKey: 'new-key' };
      const res = await service.updatePluginSettings('plugin-uuid-1', payload);
      
      expect(res).toBeDefined();
      expect(res.success).toBe(true);
      expect(pluginsRepo.updateSettings).toHaveBeenCalledWith('plugin-uuid-1', payload);
    });
  });
});
