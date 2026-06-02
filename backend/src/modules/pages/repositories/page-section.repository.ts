import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { Prisma, PageSection } from '@prisma/client';

@Injectable()
export class PageSectionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<PageSection | null> {
    return this.prisma.pageSection.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });
  }

  async findManyByPageId(pageId: string): Promise<PageSection[]> {
    return this.prisma.pageSection.findMany({
      where: {
        pageId,
        deletedAt: null,
      },
      orderBy: { position: 'asc' },
    });
  }

  async create(data: Prisma.PageSectionUncheckedCreateInput): Promise<PageSection> {
    return this.prisma.pageSection.create({
      data,
    });
  }

  async update(id: string, data: Prisma.PageSectionUpdateInput): Promise<PageSection> {
    return this.prisma.pageSection.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<PageSection> {
    // Cascade deletedAt standard soft-delete
    return this.prisma.pageSection.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async replaceLayout(pageId: string, sections: { sectionType: string; position: number; settingsJson: any; isActive?: boolean }[]): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      // Soft delete current sections
      await tx.pageSection.updateMany({
        where: { pageId, deletedAt: null },
        data: { deletedAt: new Date() },
      });

      // Insert new layouts
      if (sections && sections.length > 0) {
        // Prisma createMany is fast but lacks standard type checks, let's use single create inside transaction to prevent schema dynamic JSON string issues
        for (const sec of sections) {
          await tx.pageSection.create({
            data: {
              pageId,
              sectionType: sec.sectionType,
              position: sec.position,
              settingsJson: sec.settingsJson || {},
              isActive: sec.isActive !== undefined ? sec.isActive : true,
            },
          });
        }
      }
    });
  }

  async reorder(pageId: string, sectionIds: string[]): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      for (let index = 0; index < sectionIds.length; index++) {
        await tx.pageSection.updateMany({
          where: {
            id: sectionIds[index],
            pageId,
            deletedAt: null,
          },
          data: {
            position: index,
          },
        });
      }
    });
  }
}
