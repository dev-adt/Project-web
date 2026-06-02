import { Test, TestingModule } from '@nestjs/testing';
import { FormsService } from './forms.service';
import { FormRepository } from '../repositories/form.repository';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('FormsService', () => {
  let service: FormsService;
  let formRepo: any;

  const mockForm = {
    id: 'form-uuid',
    name: 'Contact Form',
    slug: 'contact-form',
    description: 'A contact form',
    settingsJson: { submitText: 'Send' },
    fields: [
      {
        id: 'field-1',
        formId: 'form-uuid',
        fieldType: 'text',
        label: 'Name',
        placeholder: 'Enter name',
        required: true,
        position: 0,
      },
    ],
  };

  const mockFormRepository = {
    findById: jest.fn().mockImplementation((id) => {
      if (id === 'form-uuid') return Promise.resolve(mockForm);
      return Promise.resolve(null);
    }),
    findBySlug: jest.fn().mockImplementation((slug) => {
      if (slug === 'contact-form') return Promise.resolve(mockForm);
      return Promise.resolve(null);
    }),
    create: jest.fn().mockResolvedValue(mockForm),
    update: jest.fn().mockResolvedValue(mockForm),
    softDelete: jest.fn().mockResolvedValue(mockForm),
    findMany: jest.fn().mockResolvedValue({ forms: [mockForm], total: 1 }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FormsService,
        { provide: FormRepository, useValue: mockFormRepository },
      ],
    }).compile();

    service = module.get<FormsService>(FormsService);
    formRepo = module.get<FormRepository>(FormRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should register a new dynamic form design template', async () => {
      formRepo.findBySlug.mockResolvedValueOnce(null);
      const res = await service.create({
        name: 'New Form',
        slug: 'new-form',
      });

      expect(res).toBeDefined();
      expect(res.slug).toBe('contact-form');
      expect(formRepo.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if slug already exists', async () => {
      formRepo.findBySlug.mockResolvedValueOnce(mockForm);
      await expect(
        service.create({
          name: 'Contact Form',
          slug: 'contact-form',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findOne', () => {
    it('should retrieve a single form details and fields', async () => {
      const res = await service.findOne('form-uuid');
      expect(res).toBeDefined();
      expect(res.slug).toBe('contact-form');
      expect(res.fields.length).toBe(1);
    });

    it('should throw NotFoundException if form is missing', async () => {
      await expect(service.findOne('invalid-uuid')).rejects.toThrow(NotFoundException);
    });
  });

  describe('saveFields', () => {
    it('should update and re-arrange custom fields layout', async () => {
      const fieldsInput = [
        {
          fieldType: 'email',
          label: 'Email Address',
          position: 0,
        },
      ];

      const res = await service.saveFields('form-uuid', { fields: fieldsInput });
      expect(res).toBeDefined();
      expect(formRepo.update).toHaveBeenCalledWith('form-uuid', {
        data: expect.any(Object),
        fields: fieldsInput,
      });
    });
  });
});
