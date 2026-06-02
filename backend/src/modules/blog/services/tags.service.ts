import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { TagRepository } from '../repositories/tag.repository';
import { CreateTagDto } from '../dto/create-tag.dto';
import { UpdateTagDto } from '../dto/update-tag.dto';

@Injectable()
export class TagsService {
  constructor(private readonly tagRepository: TagRepository) {}

  async create(createTagDto: CreateTagDto) {
    const existing = await this.tagRepository.findBySlug(createTagDto.slug);
    if (existing) {
      throw new ConflictException(`Tag slug ${createTagDto.slug} is already registered.`);
    }

    return this.tagRepository.create({
      name: createTagDto.name,
      slug: createTagDto.slug,
    });
  }

  async findOne(id: string) {
    const tag = await this.tagRepository.findById(id);
    if (!tag) {
      throw new NotFoundException(`Tag with ID ${id} not found.`);
    }
    return tag;
  }

  async findAll(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const { tags, total } = await this.tagRepository.findMany({
      skip,
      take: limit,
    });

    return {
      tags,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(id: string, updateTagDto: UpdateTagDto) {
    const tag = await this.findOne(id);

    const updateData: any = {};
    if (updateTagDto.name) {
      updateData.name = updateTagDto.name;
    }

    if (updateTagDto.slug && updateTagDto.slug !== tag.slug) {
      const existing = await this.tagRepository.findBySlug(updateTagDto.slug);
      if (existing) {
        throw new ConflictException(`Tag slug ${updateTagDto.slug} is already in use.`);
      }
      updateData.slug = updateTagDto.slug;
    }

    return this.tagRepository.update(id, updateData);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.tagRepository.softDelete(id);
    return { id, message: 'Tag soft deleted successfully.' };
  }
}
