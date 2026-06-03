import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { BlocksRepository } from '../repositories/blocks.repository';
import { CreateBlockDto } from '../dto/create-block.dto';
import { UpdateBlockDto } from '../dto/update-block.dto';

@Injectable()
export class BlocksService {
  constructor(private readonly blocksRepository: BlocksRepository) {}

  async findAll() {
    const blocks = await this.blocksRepository.findAll();
    return { blocks };
  }

  async findOne(id: string) {
    const block = await this.blocksRepository.findById(id);
    if (!block) {
      throw new NotFoundException(`Reusable block with ID "${id}" not found.`);
    }
    return block;
  }

  async create(createBlockDto: CreateBlockDto) {
    const existing = await this.blocksRepository.findByName(createBlockDto.name);
    if (existing) {
      throw new ConflictException(`Reusable block with name "${createBlockDto.name}" already exists.`);
    }
    return this.blocksRepository.create(createBlockDto);
  }

  async update(id: string, updateBlockDto: UpdateBlockDto) {
    await this.findOne(id);
    if (updateBlockDto.name) {
      const existing = await this.blocksRepository.findByName(updateBlockDto.name);
      if (existing && existing.id !== id) {
        throw new ConflictException(`Another reusable block with name "${updateBlockDto.name}" already exists.`);
      }
    }
    return this.blocksRepository.update(id, updateBlockDto);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.blocksRepository.softDelete(id);
    return { id, message: 'Reusable block soft-deleted successfully.' };
  }
}
