import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UserRepository } from '../repositories/user.repository';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let repository: any;

  const mockUser = {
    id: 'user-uuid',
    email: 'user@example.com',
    username: 'user',
    fullName: 'John Doe',
    status: 'active',
  };

  const mockUserRepository = {
    findById: jest.fn().mockImplementation((id) => {
      if (id === 'user-uuid') return Promise.resolve(mockUser);
      return Promise.resolve(null);
    }),
    findByEmail: jest.fn().mockImplementation((email) => {
      if (email === 'user@example.com') return Promise.resolve(mockUser);
      return Promise.resolve(null);
    }),
    findByUsername: jest.fn().mockImplementation((username) => {
      if (username === 'user') return Promise.resolve(mockUser);
      return Promise.resolve(null);
    }),
    create: jest.fn().mockResolvedValue(mockUser),
    update: jest.fn().mockResolvedValue(mockUser),
    softDelete: jest.fn().mockResolvedValue(mockUser),
    assignRoles: jest.fn().mockResolvedValue(undefined),
    findMany: jest.fn().mockResolvedValue({ users: [mockUser], total: 1 }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<UserRepository>(UserRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should register a new user successfully', async () => {
      repository.findByEmail.mockResolvedValueOnce(null);
      repository.findByUsername.mockResolvedValueOnce(null);
      
      const res = await service.create({
        email: 'new@example.com',
        fullName: 'New User',
      });
      expect(res).toBeDefined();
      expect(res.email).toBe('user@example.com');
    });

    it('should throw ConflictException if email exists', async () => {
      repository.findByEmail.mockResolvedValueOnce(mockUser);
      await expect(service.create({
        email: 'user@example.com',
        fullName: 'John Doe',
      })).rejects.toThrow(ConflictException);
    });
  });

  describe('findOne', () => {
    it('should retrieve a single user profile details', async () => {
      const res = await service.findOne('user-uuid');
      expect(res).toBeDefined();
      expect(res.email).toBe('user@example.com');
    });

    it('should throw NotFoundException if user is missing', async () => {
      await expect(service.findOne('invalid-uuid')).rejects.toThrow(NotFoundException);
    });
  });
});
