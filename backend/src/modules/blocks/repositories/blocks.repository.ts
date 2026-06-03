import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { ReusableBlock } from '@prisma/client';

@Injectable()
export class BlocksRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<ReusableBlock[]> {
    return this.prisma.reusableBlock.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string): Promise<ReusableBlock | null> {
    return this.prisma.reusableBlock.findFirst({
      where: { id, deletedAt: null },
    });
  }

  async findByName(name: string): Promise<ReusableBlock | null> {
    return this.prisma.reusableBlock.findFirst({
      where: { name, deletedAt: null },
    });
  }

  async create(data: { name: string; type: string; settingsJson: any }): Promise<ReusableBlock> {
    return this.prisma.reusableBlock.create({
      data: {
        name: data.name,
        type: data.type,
        settingsJson: data.settingsJson ?? {},
      },
    });
  }

  async update(id: string, data: { name?: string; type?: string; settingsJson?: any }): Promise<ReusableBlock> {
    return this.prisma.reusableBlock.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: string): Promise<ReusableBlock> {
    return this.prisma.reusableBlock.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
