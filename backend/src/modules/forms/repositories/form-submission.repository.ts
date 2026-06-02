import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { FormSubmission, FormSubmissionValue } from '@prisma/client';

@Injectable()
export class FormSubmissionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(params: {
    formId: string;
    ipAddress?: string;
    userAgent?: string;
    values: Array<{
      fieldId: string;
      value: string;
    }>;
  }): Promise<FormSubmission> {
    const { formId, ipAddress, userAgent, values } = params;

    return this.prisma.$transaction(async (tx) => {
      const submission = await tx.formSubmission.create({
        data: {
          formId,
          ipAddress,
          userAgent,
        },
      });

      if (values && values.length > 0) {
        await tx.formSubmissionValue.createMany({
          data: values.map((val) => ({
            submissionId: submission.id,
            fieldId: val.fieldId,
            value: val.value,
          })),
        });
      }

      return submission;
    });
  }

  async findManyByFormId(
    formId: string,
    params: {
      skip?: number;
      take?: number;
    },
  ): Promise<{ submissions: any[]; total: number }> {
    const { skip, take } = params;

    const [rawSubmissions, total] = await Promise.all([
      this.prisma.formSubmission.findMany({
        skip,
        take,
        where: {
          formId,
          deletedAt: null,
        },
        include: {
          values: {
            include: {
              field: true,
            },
          },
        },
        orderBy: { submittedAt: 'desc' },
      }),
      this.prisma.formSubmission.count({
        where: {
          formId,
          deletedAt: null,
        },
      }),
    ]);

    const submissions = rawSubmissions.map((sub) => {
      const valuesMap: Record<string, string> = {};
      sub.values.forEach((val) => {
        // Map by field label and field ID to support flexible lookups
        valuesMap[val.fieldId] = val.value;
        if (val.field?.label) {
          valuesMap[val.field.label] = val.value;
        }
      });

      return {
        id: sub.id,
        ipAddress: sub.ipAddress,
        userAgent: sub.userAgent,
        submittedAt: sub.submittedAt,
        values: valuesMap,
      };
    });

    return { submissions, total };
  }
}
