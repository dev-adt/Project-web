import { Test, TestingModule } from '@nestjs/testing';
import { RolesService } from './roles.service';
import { RoleRepository } from '../repositories/role.repository';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('RolesService', () => {
  let service: RolesService;
  let repository: any;

  const mockRole = {
    id: 'role-uuid',
    name: 'EDITOR',
    description: 'Editor Role',
  };

  const mockRoleRepository = {
    findById: jest.fn().mockImplementation((id) => {
      if (id === 'role-uuid') return Promise.resolve(mockRole);
      return Promise.resolve(null);
    }),
    findByName: jest.fn().mockImplementation((name) => {
      if (name === 'EDITOR') return Promise.resolve(mockRole);
      return Promise.resolve(null);
    }),
    create: jest.fn().mockResolvedValue(mockRole),
    update: jest.fn().mockResolvedValue(mockRole),
    softDelete: jest.fn().mockResolvedValue(mockRole),
    findMany: jest.fn().mockResolvedValue({ roles: [mockRole], total: 1 }),
    assignPermissions: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        {
          provide: RoleRepository,
          useValue: mockRoleRepository,
        },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
    repository = module.get<RoleRepository>(RoleRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create new role successfully', async () => {
      repository.findByName.mockResolvedValueOnce(null);
      const res = await service.create({ name: 'NEW_ROLE' });
      expect(res).toBeDefined();
      expect(res.name).toBe('EDITOR');
    });

    it('should throw ConflictException if role name exists', async () => {
      repository.findByName.mockResolvedValueOnce(mockRole);
      await expect(service.create({ name: 'EDITOR' })).rejects.toThrow(ConflictException);
    });
  });

  describe('findOne', () => {
    it('should retrieve role detail', async () => {
      const res = await service.findOne('role-uuid');
      expect(res).toBeDefined();
      expect(res.name).toBe('EDITOR');
    });

    it('should throw NotFoundException if role missing', async () => {
      await expect(service.findOne('invalid-uuid')).rejects.toThrow(NotFoundException);
    });
  });
});
