import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { Plugin, PluginSetting } from '@prisma/client';

@Injectable()
export class PluginsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Plugin[]> {
    return this.prisma.plugin.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string): Promise<(Plugin & { settings: PluginSetting[] }) | null> {
    return this.prisma.plugin.findUnique({
      where: { id },
      include: { settings: true },
    });
  }

  async findBySlug(slug: string): Promise<(Plugin & { settings: PluginSetting[] }) | null> {
    return this.prisma.plugin.findUnique({
      where: { slug },
      include: { settings: true },
    });
  }

  async upsertPlugin(params: {
    slug: string;
    name: string;
    description: string;
    version: string;
    enabled?: boolean;
    settingsJson?: any;
  }): Promise<Plugin> {
    return this.prisma.plugin.upsert({
      where: { slug: params.slug },
      update: {
        name: params.name,
        description: params.description,
        version: params.version,
        ...(params.enabled !== undefined && { enabled: params.enabled }),
        ...(params.settingsJson !== undefined && { settingsJson: params.settingsJson }),
      },
      create: {
        slug: params.slug,
        name: params.name,
        description: params.description,
        version: params.version,
        enabled: params.enabled ?? false,
        settingsJson: params.settingsJson ?? {},
      },
    });
  }

  async setEnabled(id: string, enabled: boolean): Promise<Plugin> {
    return this.prisma.plugin.update({
      where: { id },
      data: { enabled },
    });
  }

  async getSettings(pluginId: string): Promise<PluginSetting[]> {
    return this.prisma.pluginSetting.findMany({
      where: { pluginId },
    });
  }

  async updateSettings(pluginId: string, settings: Record<string, string>): Promise<void> {
    // Standard transaction to update all keys
    const operations = Object.entries(settings).map(([key, value]) => {
      return this.prisma.pluginSetting.upsert({
        where: {
          pluginId_key: {
            pluginId,
            key,
          },
        },
        update: { value },
        create: {
          pluginId,
          key,
          value,
        },
      });
    });

    await this.prisma.$transaction(operations);
  }
}
