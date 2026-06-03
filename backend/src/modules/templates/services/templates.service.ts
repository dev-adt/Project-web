import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { TemplatesRepository } from '../repositories/templates.repository';
import { PrismaService } from '../../../database/prisma.service';
import { CreateTemplateDto } from '../dto/create-template.dto';

@Injectable()
export class TemplatesService {
  constructor(
    private readonly templatesRepository: TemplatesRepository,
    private readonly prisma: PrismaService,
  ) {}

  async findAll() {
    const templates = await this.templatesRepository.findAll();
    return { templates };
  }

  async findOne(id: string) {
    const template = await this.templatesRepository.findById(id);
    if (!template) {
      throw new NotFoundException(`Template with ID ${id} not found.`);
    }
    return template;
  }

  async create(createTemplateDto: CreateTemplateDto) {
    const existing = await this.templatesRepository.findByName(createTemplateDto.name);
    if (existing) {
      throw new ConflictException(`Template with name "${createTemplateDto.name}" already exists.`);
    }
    return this.templatesRepository.create(createTemplateDto);
  }

  async createPageFromTemplate(templateId: string, data: { title: string; slug: string }) {
    const template = await this.findOne(templateId);

    // Verify slug uniqueness
    const existingPage = await this.prisma.page.findFirst({
      where: { slug: data.slug, deletedAt: null },
    });
    if (existingPage) {
      throw new ConflictException(`Slug "${data.slug}" is already registered.`);
    }

    // Create the page and clone sections inside a transaction
    return this.prisma.$transaction(async (tx) => {
      const page = await tx.page.create({
        data: {
          title: data.title,
          slug: data.slug,
          status: 'draft',
          templateId: template.id,
        },
      });

      if (template.sections && template.sections.length > 0) {
        for (const sec of template.sections) {
          await tx.pageSection.create({
            data: {
              pageId: page.id,
              sectionType: sec.sectionType,
              position: sec.position,
              settingsJson: sec.settingsJson || {},
              isActive: true,
            },
          });
        }
      }

      return page;
    });
  }
}
