import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { Prisma, MediaFolder } from '@prisma/client';

@Injectable()
export class MediaFolderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<MediaFolder | null> {
    return this.prisma.mediaFolder.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        children: {
          where: { deletedAt: null },
        },
        files: {
          where: { deletedAt: null },
        },
      },
    });
  }

  async findMany(params: {
    where?: Prisma.MediaFolderWhereInput;
  }): Promise<MediaFolder[]> {
    const { where } = params;
    return this.prisma.mediaFolder.findMany({
      where: {
        ...where,
        deletedAt: null,
      },
      orderBy: { name: 'asc' },
    });
  }

  async create(data: Prisma.MediaFolderUncheckedCreateInput): Promise<MediaFolder> {
    return this.prisma.mediaFolder.create({
      data,
    });
  }

  async update(id: string, data: Prisma.MediaFolderUpdateInput): Promise<MediaFolder> {
    return this.prisma.mediaFolder.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: string): Promise<MediaFolder> {
    return this.prisma.mediaFolder.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
