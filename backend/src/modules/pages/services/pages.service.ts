import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PageRepository } from '../repositories/page.repository';
import { PageSectionRepository } from '../repositories/page-section.repository';
import { PageVersionRepository } from '../repositories/page-version.repository';
import { CreatePageDto } from '../dto/create-page.dto';
import { UpdatePageDto } from '../dto/update-page.dto';
import { SaveLayoutDto } from '../dto/save-layout.dto';
import { CreateSectionDto } from '../dto/create-section.dto';
import { UpdateSectionDto } from '../dto/update-section.dto';

@Injectable()
export class PagesService {
  constructor(
    private readonly pageRepository: PageRepository,
    private readonly sectionRepository: PageSectionRepository,
    private readonly versionRepository: PageVersionRepository,
  ) {}

  async create(createPageDto: CreatePageDto) {
    const existing = await this.pageRepository.findBySlug(createPageDto.slug);
    if (existing) {
      throw new ConflictException(`Slug ${createPageDto.slug} is already registered.`);
    }

    return this.pageRepository.create({
      title: createPageDto.title,
      slug: createPageDto.slug,
      status: 'draft',
    });
  }

  async findOne(id: string) {
    const page = await this.pageRepository.findById(id);
    if (!page) {
      throw new NotFoundException(`Page with ID ${id} not found.`);
    }
    return page;
  }

  async findBySlug(slug: string) {
    const page = await this.pageRepository.findBySlug(slug);
    if (!page) {
      throw new NotFoundException(`Page with slug ${slug} not found.`);
    }
    return page;
  }

  async findAll(page: number, limit: number, status?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (status) {
      where.status = status;
    }

    const { pages, total } = await this.pageRepository.findMany({
      skip,
      take: limit,
      where,
    });

    return {
      pages,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(id: string, updatePageDto: UpdatePageDto) {
    const page = await this.findOne(id);

    const updateData: any = {};
    if (updatePageDto.title) {
      updateData.title = updatePageDto.title;
    }

    if (updatePageDto.slug && updatePageDto.slug !== page.slug) {
      const existing = await this.pageRepository.findBySlug(updatePageDto.slug);
      if (existing) {
        throw new ConflictException(`Slug ${updatePageDto.slug} is already in use.`);
      }
      updateData.slug = updatePageDto.slug;
    }

    if (updatePageDto.status) {
      updateData.status = updatePageDto.status;
    }

    return this.pageRepository.update(id, updateData);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.pageRepository.softDelete(id);
    return { id, message: 'Page soft deleted successfully.' };
  }

  async duplicate(id: string) {
    const original = await this.findOne(id);

    // Compute unique duplicate slug
    const duplicateSlug = `${original.slug}-copy-${Date.now().toString().slice(-4)}`;
    const duplicatePage = await this.pageRepository.create({
      title: `Copy of ${original.title}`,
      slug: duplicateSlug,
      status: 'draft',
    });

    // Fetch and replicate original layout sections
    const originalSections = await this.sectionRepository.findManyByPageId(id);
    if (originalSections && originalSections.length > 0) {
      const copiedSections = originalSections.map((sec) => ({
        sectionType: sec.sectionType,
        position: sec.position,
        settingsJson: sec.settingsJson || {},
        isActive: sec.isActive,
      }));
      await this.sectionRepository.replaceLayout(duplicatePage.id, copiedSections);
    }

    return this.findOne(duplicatePage.id);
  }

  async publish(id: string, changeNote?: string) {
    const page = await this.findOne(id);

    // Fetch active layout sections
    const activeSections = await this.sectionRepository.findManyByPageId(id);

    // Construct full layout JSON snapshot
    const layoutJson = {
      sections: activeSections.map((sec) => ({
        id: sec.id,
        sectionType: sec.sectionType,
        position: sec.position,
        settingsJson: sec.settingsJson,
        isActive: sec.isActive,
      })),
    };

    // Save snapshot to database versions table
    await this.versionRepository.create(id, layoutJson, changeNote || `Published standard snapshot`);

    // Set page state to published
    return this.pageRepository.update(id, { status: 'published' });
  }

  async archive(id: string) {
    await this.findOne(id);
    return this.pageRepository.update(id, { status: 'archived' });
  }

  // Layout Builder Operations
  async getLayout(pageId: string) {
    await this.findOne(pageId);
    const sections = await this.sectionRepository.findManyByPageId(pageId);
    return { sections };
  }

  async saveLayout(pageId: string, saveLayoutDto: SaveLayoutDto) {
    await this.findOne(pageId);
    await this.sectionRepository.replaceLayout(pageId, saveLayoutDto.sections);
    return this.getLayout(pageId);
  }

  async addSection(pageId: string, createSectionDto: CreateSectionDto) {
    await this.findOne(pageId);
    await this.sectionRepository.create({
      pageId,
      sectionType: createSectionDto.sectionType,
      position: createSectionDto.position,
      settingsJson: createSectionDto.settingsJson,
      isActive: createSectionDto.isActive !== undefined ? createSectionDto.isActive : true,
    });
    return this.getLayout(pageId);
  }

  async updateSection(pageId: string, sectionId: string, updateSectionDto: UpdateSectionDto) {
    await this.findOne(pageId);
    const section = await this.sectionRepository.findById(sectionId);
    if (!section || section.pageId !== pageId) {
      throw new NotFoundException(`Section with ID ${sectionId} not found under this page layout.`);
    }

    const updateData: any = {};
    if (updateSectionDto.sectionType) {
      updateData.sectionType = updateSectionDto.sectionType;
    }
    if (updateSectionDto.position !== undefined) {
      updateData.position = updateSectionDto.position;
    }
    if (updateSectionDto.settingsJson) {
      updateData.settingsJson = updateSectionDto.settingsJson;
    }
    if (updateSectionDto.isActive !== undefined) {
      updateData.isActive = updateSectionDto.isActive;
    }

    await this.sectionRepository.update(sectionId, updateData);
    return this.getLayout(pageId);
  }

  async deleteSection(pageId: string, sectionId: string) {
    await this.findOne(pageId);
    const section = await this.sectionRepository.findById(sectionId);
    if (!section || section.pageId !== pageId) {
      throw new NotFoundException(`Section with ID ${sectionId} not found under this page layout.`);
    }

    await this.sectionRepository.delete(sectionId);
    return this.getLayout(pageId);
  }

  async reorderSections(pageId: string, sectionIds: string[]) {
    await this.findOne(pageId);
    await this.sectionRepository.reorder(pageId, sectionIds);
    return this.getLayout(pageId);
  }

  // Version Control Operations
  async listVersions(pageId: string) {
    await this.findOne(pageId);
    return this.versionRepository.findManyByPageId(pageId);
  }

  async getVersion(pageId: string, versionId: string) {
    await this.findOne(pageId);
    const version = await this.versionRepository.findById(versionId);
    if (!version || version.pageId !== pageId) {
      throw new NotFoundException(`Version snapshot with ID ${versionId} not found.`);
    }
    return version;
  }

  async restoreVersion(pageId: string, versionId: string) {
    await this.findOne(pageId);
    const version = await this.getVersion(pageId, versionId);

    // Parse layout JSON snapshot and restore page layout
    const layout = version.layoutJson as { sections?: any[] };
    if (layout && layout.sections) {
      const restoredSections = layout.sections.map((sec) => ({
        sectionType: sec.sectionType,
        position: sec.position,
        settingsJson: sec.settingsJson || {},
        isActive: sec.isActive,
      }));
      await this.sectionRepository.replaceLayout(pageId, restoredSections);
    }

    return this.getLayout(pageId);
  }

  async createSnapshot(pageId: string, changeNote?: string) {
    await this.findOne(pageId);

    // Fetch active layout sections
    const activeSections = await this.sectionRepository.findManyByPageId(pageId);

    // Construct full layout JSON snapshot
    const layoutJson = {
      sections: activeSections.map((sec) => ({
        id: sec.id,
        sectionType: sec.sectionType,
        position: sec.position,
        settingsJson: sec.settingsJson,
        isActive: sec.isActive,
      })),
    };

    // Save snapshot in dynamic versions registry
    return this.versionRepository.create(pageId, layoutJson, changeNote || `Manual checkpoint snapshot`);
  }

  async compareVersions(pageId: string, compareVersionId: string, baseVersionId?: string) {
    await this.findOne(pageId);

    // 1. Resolve Base Layout Sections
    let baseSections: any[] = [];
    if (!baseVersionId || baseVersionId === 'draft') {
      const active = await this.sectionRepository.findManyByPageId(pageId);
      baseSections = active.map((sec) => ({
        id: sec.id,
        sectionType: sec.sectionType,
        position: sec.position,
        settingsJson: sec.settingsJson,
        isActive: sec.isActive,
      }));
    } else {
      const baseVer = await this.versionRepository.findById(baseVersionId);
      if (!baseVer || baseVer.pageId !== pageId) {
        throw new NotFoundException(`Base version layout snapshot not found.`);
      }
      const layout = baseVer.layoutJson as { sections?: any[] };
      baseSections = layout?.sections || [];
    }

    // 2. Resolve Compare Layout Sections
    const compareVer = await this.versionRepository.findById(compareVersionId);
    if (!compareVer || compareVer.pageId !== pageId) {
      throw new NotFoundException(`Comparison version layout snapshot not found.`);
    }
    const compareLayout = compareVer.layoutJson as { sections?: any[] };
    const compareSections = compareLayout?.sections || [];

    // 3. Compute structural diff maps
    const baseMap = new Map<string, any>(baseSections.map((sec) => [sec.id, sec]));
    const compareMap = new Map<string, any>(compareSections.map((sec) => [sec.id, sec]));

    const added: any[] = [];
    const removed: any[] = [];
    const modified: any[] = [];

    // Added and Modified checks
    compareSections.forEach((cSec) => {
      const bSec = baseMap.get(cSec.id);
      if (!bSec) {
        added.push(cSec);
      } else {
        const isTypeDiff = cSec.sectionType !== bSec.sectionType;
        const isActiveDiff = cSec.isActive !== bSec.isActive;
        const isSettingsDiff = JSON.stringify(cSec.settingsJson) !== JSON.stringify(bSec.settingsJson);

        if (isTypeDiff || isActiveDiff || isSettingsDiff) {
          modified.push({
            id: cSec.id,
            sectionType: cSec.sectionType,
            isActive: cSec.isActive,
            base: {
              sectionType: bSec.sectionType,
              isActive: bSec.isActive,
              settingsJson: bSec.settingsJson,
            },
            compare: {
              sectionType: cSec.sectionType,
              isActive: cSec.isActive,
              settingsJson: cSec.settingsJson,
            },
          });
        }
      }
    });

    // Removed checks
    baseSections.forEach((bSec) => {
      if (!compareMap.has(bSec.id)) {
        removed.push(bSec);
      }
    });

    return {
      added,
      removed,
      modified,
      baseVersionId: baseVersionId || 'draft',
      compareVersionId,
    };
  }
}
