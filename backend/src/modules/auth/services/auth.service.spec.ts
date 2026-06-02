import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserRepository } from '../../users/repositories/user.repository';
import { RefreshTokenRepository } from '../repositories/refresh-token.repository';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: any;

  const mockUser = {
    id: 'user-uuid',
    email: 'admin@example.com',
    passwordHash: 'hashed_password',
    status: 'active',
  };

  const mockUserRepository = {
    findByEmail: jest.fn().mockImplementation((email) => {
      if (email === 'admin@example.com') return Promise.resolve(mockUser);
      return Promise.resolve(null);
    }),
    update: jest.fn().mockResolvedValue(mockUser),
  };

  const mockRefreshTokenRepository = {
    create: jest.fn().mockResolvedValue({}),
    findByToken: jest.fn().mockResolvedValue(null),
    revoke: jest.fn().mockResolvedValue({}),
  };

  const mockJwtService = {
    signAsync: jest.fn().mockResolvedValue('token_string'),
  };

  const mockConfigService = {
    get: jest.fn().mockImplementation((key) => {
      if (key === 'jwt.expiration') return '3600s';
      if (key === 'jwt.refreshExpiration') return '604800s';
      return 'secret_key';
    }),
  };

  beforeEach(async () => {
    jest.spyOn(bcrypt, 'compare').mockImplementation((pass, hash) => {
      if (pass === 'password' && hash === 'hashed_password') return Promise.resolve(true);
      return Promise.resolve(false);
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserRepository, useValue: mockUserRepository },
        { provide: RefreshTokenRepository, useValue: mockRefreshTokenRepository },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<UserRepository>(UserRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const res = await service.login({
        email: 'admin@example.com',
        password: 'password',
      });
      expect(res).toBeDefined();
      expect(res.accessToken).toBe('token_string');
    });

    it('should throw UnauthorizedException on invalid password', async () => {
      await expect(service.login({
        email: 'admin@example.com',
        password: 'wrong_password',
      })).rejects.toThrow(UnauthorizedException);
    });
  });
});
