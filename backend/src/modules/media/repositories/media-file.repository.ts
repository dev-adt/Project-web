import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { Prisma, MediaFile } from '@prisma/client';

@Injectable()
export class MediaFileRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<MediaFile | null> {
    return this.prisma.mediaFile.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });
  }

  async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.MediaFileWhereInput;
  }): Promise<{ files: MediaFile[]; total: number }> {
    const { skip, take, where } = params;
    const finalWhere = {
      ...where,
      deletedAt: null,
    };

    const [files, total] = await Promise.all([
      this.prisma.mediaFile.findMany({
        skip,
        take,
        where: finalWhere,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.mediaFile.count({
        where: finalWhere,
      }),
    ]);

    return { files, total };
  }

  async create(data: Prisma.MediaFileUncheckedCreateInput): Promise<MediaFile> {
    return this.prisma.mediaFile.create({
      data,
    });
  }

  async update(id: string, data: Prisma.MediaFileUpdateInput): Promise<MediaFile> {
    return this.prisma.mediaFile.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: string): Promise<MediaFile> {
    return this.prisma.mediaFile.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
