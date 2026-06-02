import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { Prisma, Form, FormField } from '@prisma/client';

@Injectable()
export class FormRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<(Form & { fields: FormField[] }) | null> {
    return this.prisma.form.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        fields: {
          where: { deletedAt: null },
          orderBy: { position: 'asc' },
        },
      },
    });
  }

  async findBySlug(slug: string): Promise<(Form & { fields: FormField[] }) | null> {
    return this.prisma.form.findFirst({
      where: {
        slug,
        deletedAt: null,
      },
      include: {
        fields: {
          where: { deletedAt: null },
          orderBy: { position: 'asc' },
        },
      },
    });
  }

  async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.FormWhereInput;
  }): Promise<{ forms: Form[]; total: number }> {
    const { skip, take, where } = params;
    const finalWhere = {
      ...where,
      deletedAt: null,
    };

    const [forms, total] = await Promise.all([
      this.prisma.form.findMany({
        skip,
        take,
        where: finalWhere,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.form.count({
        where: finalWhere,
      }),
    ]);

    return { forms, total };
  }

  async create(data: Prisma.FormCreateInput): Promise<Form> {
    return this.prisma.form.create({
      data,
    });
  }

  async update(
    id: string,
    params: {
      data: Partial<Omit<Prisma.FormUpdateInput, 'fields'>>;
      fields?: Array<{
        id?: string;
        fieldType: string;
        label: string;
        placeholder?: string;
        required?: boolean;
        position: number;
        settingsJson?: any;
      }>;
    },
  ): Promise<Form & { fields: FormField[] }> {
    const { data, fields } = params;

    return this.prisma.$transaction(async (tx) => {
      // 1. Update form main properties
      await tx.form.update({
        where: { id },
        data,
      });

      // 2. Re-arrange form fields if provided
      if (fields !== undefined) {
        const incomingFieldIds = fields.map((f) => f.id).filter(Boolean) as string[];

        // Soft-delete fields not present in incoming list
        await tx.formField.updateMany({
          where: {
            formId: id,
            id: { notIn: incomingFieldIds },
            deletedAt: null,
          },
          data: {
            deletedAt: new Date(),
          },
        });

        // Upsert fields
        for (const field of fields) {
          if (field.id) {
            // Update existing field
            await tx.formField.update({
              where: { id: field.id },
              data: {
                fieldType: field.fieldType,
                label: field.label,
                placeholder: field.placeholder,
                required: field.required !== undefined ? field.required : false,
                position: field.position,
                settingsJson: field.settingsJson || Prisma.JsonNull,
              },
            });
          } else {
            // Create new field
            await tx.formField.create({
              data: {
                formId: id,
                fieldType: field.fieldType,
                label: field.label,
                placeholder: field.placeholder,
                required: field.required !== undefined ? field.required : false,
                position: field.position,
                settingsJson: field.settingsJson || Prisma.JsonNull,
              },
            });
          }
        }
      }

      // Return refreshed form with active fields
      const updatedForm = await tx.form.findUnique({
        where: { id },
        include: {
          fields: {
            where: { deletedAt: null },
            orderBy: { position: 'asc' },
          },
        },
      });

      if (!updatedForm) throw new Error(`Form with ID ${id} not found.`);
      return updatedForm;
    });
  }

  async softDelete(id: string): Promise<Form> {
    return this.prisma.form.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
