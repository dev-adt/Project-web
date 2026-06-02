import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { CategoryRepository } from '../repositories/category.repository';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const existing = await this.categoryRepository.findBySlug(createCategoryDto.slug);
    if (existing) {
      throw new ConflictException(`Category slug ${createCategoryDto.slug} is already registered.`);
    }

    return this.categoryRepository.create({
      name: createCategoryDto.name,
      slug: createCategoryDto.slug,
      description: createCategoryDto.description,
    });
  }

  async findOne(id: string) {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found.`);
    }
    return category;
  }

  async findAll(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const { categories, total } = await this.categoryRepository.findMany({
      skip,
      take: limit,
    });

    return {
      categories,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.findOne(id);

    const updateData: any = {};
    if (updateCategoryDto.name) {
      updateData.name = updateCategoryDto.name;
    }

    if (updateCategoryDto.slug && updateCategoryDto.slug !== category.slug) {
      const existing = await this.categoryRepository.findBySlug(updateCategoryDto.slug);
      if (existing) {
        throw new ConflictException(`Category slug ${updateCategoryDto.slug} is already in use.`);
      }
      updateData.slug = updateCategoryDto.slug;
    }

    if (updateCategoryDto.description !== undefined) {
      updateData.description = updateCategoryDto.description;
    }

    return this.categoryRepository.update(id, updateData);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.categoryRepository.softDelete(id);
    return { id, message: 'Category soft deleted successfully.' };
  }
}
