import { Injectable, NotFoundException } from '@nestjs/common';
import { FormSubmissionRepository } from '../repositories/form-submission.repository';
import { FormRepository } from '../repositories/form.repository';
import { SubmitFormDto } from '../dto/submit-form.dto';

@Injectable()
export class SubmissionsService {
  constructor(
    private readonly submissionRepository: FormSubmissionRepository,
    private readonly formRepository: FormRepository,
  ) {}

  async submit(slug: string, submitFormDto: SubmitFormDto, ipAddress?: string, userAgent?: string) {
    const form = await this.formRepository.findBySlug(slug);
    if (!form) {
      throw new NotFoundException(`Form with slug ${slug} not found.`);
    }

    // Capture dynamic inputs mapping
    const values = submitFormDto.values.map((v) => ({
      fieldId: v.fieldId,
      value: v.value,
    }));

    return this.submissionRepository.create({
      formId: form.id,
      ipAddress,
      userAgent,
      values,
    });
  }

  async getSubmissions(formId: string, page: number, limit: number) {
    const form = await this.formRepository.findById(formId);
    if (!form) {
      throw new NotFoundException(`Form with ID ${formId} not found.`);
    }

    const skip = (page - 1) * limit;
    const { submissions, total } = await this.submissionRepository.findManyByFormId(formId, {
      skip,
      take: limit,
    });

    return {
      submissions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      fields: form.fields,
    };
  }

  async exportCSV(formId: string): Promise<{ filename: string; csv: string }> {
    const form = await this.formRepository.findById(formId);
    if (!form) {
      throw new NotFoundException(`Form with ID ${formId} not found.`);
    }

    // Fetch all submissions for the form (no pagination limits)
    const { submissions } = await this.submissionRepository.findManyByFormId(formId, {});

    const fields = form.fields;

    // Build header columns
    const headers = ['Submitted At', 'IP Address', 'User Agent'];
    fields.forEach((field) => {
      headers.push(field.label);
    });

    const escapeCSV = (val: any) => {
      if (val === null || val === undefined) return '';
      const str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const csvRows = [headers.map(escapeCSV).join(',')];

    submissions.forEach((sub) => {
      const row = [
        sub.submittedAt.toISOString(),
        sub.ipAddress || '',
        sub.userAgent || '',
      ];

      fields.forEach((field) => {
        // Map from sub values dictionary by field label or field ID
        const val = sub.values[field.id] || sub.values[field.label] || '';
        row.push(val);
      });

      csvRows.push(row.map(escapeCSV).join(','));
    });

    const filename = `${form.slug}-submissions-${Date.now()}.csv`;
    return {
      filename,
      csv: csvRows.join('\r\n'),
    };
  }
}
