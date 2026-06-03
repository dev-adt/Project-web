import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { Template, TemplateSection } from '@prisma/client';

@Injectable()
export class TemplatesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<(Template & { sections: TemplateSection[] })[]> {
    return this.prisma.template.findMany({
      where: { deletedAt: null },
      include: {
        sections: {
          orderBy: { position: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string): Promise<(Template & { sections: TemplateSection[] }) | null> {
    return this.prisma.template.findFirst({
      where: { id, deletedAt: null },
      include: {
        sections: {
          orderBy: { position: 'asc' },
        },
      },
    });
  }

  async findByName(name: string): Promise<Template | null> {
    return this.prisma.template.findFirst({
      where: { name, deletedAt: null },
    });
  }

  async create(data: {
    name: string;
    description?: string;
    thumbnail?: string;
    sections: { sectionType: string; position: number; settingsJson?: any }[];
  }): Promise<Template> {
    return this.prisma.template.create({
      data: {
        name: data.name,
        description: data.description,
        thumbnail: data.thumbnail,
        sections: {
          create: data.sections.map((sec) => ({
            sectionType: sec.sectionType,
            position: sec.position,
            settingsJson: sec.settingsJson ?? {},
          })),
        },
      },
      include: {
        sections: true,
      },
    });
  }

  async softDelete(id: string): Promise<Template> {
    return this.prisma.template.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
