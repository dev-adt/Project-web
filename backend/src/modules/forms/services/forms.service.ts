import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { FormRepository } from '../repositories/form.repository';
import { CreateFormDto } from '../dto/create-form.dto';
import { UpdateFormDto } from '../dto/update-form.dto';
import { SaveFormFieldsDto } from '../dto/save-form-fields.dto';

@Injectable()
export class FormsService {
  constructor(private readonly formRepository: FormRepository) {}

  async create(createFormDto: CreateFormDto, userId?: string) {
    const existing = await this.formRepository.findBySlug(createFormDto.slug);
    if (existing) {
      throw new ConflictException(`Form slug ${createFormDto.slug} is already registered.`);
    }

    return this.formRepository.create({
      name: createFormDto.name,
      slug: createFormDto.slug,
      description: createFormDto.description,
      settingsJson: createFormDto.settingsJson || {},
      createdBy: userId,
    });
  }

  async findOne(id: string) {
    const form = await this.formRepository.findById(id);
    if (!form) {
      throw new NotFoundException(`Form with ID ${id} not found.`);
    }
    return form;
  }

  async findBySlug(slug: string) {
    const form = await this.formRepository.findBySlug(slug);
    if (!form) {
      throw new NotFoundException(`Form with slug ${slug} not found.`);
    }
    return form;
  }

  async findAll(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const { forms, total } = await this.formRepository.findMany({
      skip,
      take: limit,
    });

    return {
      forms,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(id: string, updateFormDto: UpdateFormDto, userId?: string) {
    const form = await this.findOne(id);

    const updateData: any = {
      updatedBy: userId,
    };

    if (updateFormDto.name) {
      updateData.name = updateFormDto.name;
    }

    if (updateFormDto.slug && updateFormDto.slug !== form.slug) {
      const existing = await this.formRepository.findBySlug(updateFormDto.slug);
      if (existing) {
        throw new ConflictException(`Form slug ${updateFormDto.slug} is already in use.`);
      }
      updateData.slug = updateFormDto.slug;
    }

    if (updateFormDto.description !== undefined) {
      updateData.description = updateFormDto.description;
    }

    if (updateFormDto.settingsJson !== undefined) {
      updateData.settingsJson = updateFormDto.settingsJson;
    }

    return this.formRepository.update(id, {
      data: updateData,
    });
  }

  async saveFields(id: string, saveFormFieldsDto: SaveFormFieldsDto, userId?: string) {
    await this.findOne(id);
    return this.formRepository.update(id, {
      data: { updatedBy: userId },
      fields: saveFormFieldsDto.fields,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.formRepository.softDelete(id);
    return { id, message: 'Form soft deleted successfully.' };
  }
}
