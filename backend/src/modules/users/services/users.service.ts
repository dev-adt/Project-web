import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository) {}

  async create(createUserDto: CreateUserDto) {
    const existingEmail = await this.userRepository.findByEmail(createUserDto.email);
    if (existingEmail) {
      throw new ConflictException('Email already registered.');
    }

    const username = createUserDto.username || createUserDto.email.split('@')[0];
    const existingUsername = await this.userRepository.findByUsername(username);
    if (existingUsername) {
      throw new ConflictException('Username already registered.');
    }

    const rawPassword = createUserDto.password || 'Password123';
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(rawPassword, salt);

    const user = await this.userRepository.create({
      email: createUserDto.email,
      username,
      fullName: createUserDto.fullName,
      passwordHash,
      status: 'active',
    });

    if (createUserDto.roleIds && createUserDto.roleIds.length > 0) {
      await this.userRepository.assignRoles(user.id, createUserDto.roleIds);
    }

    return this.findOne(user.id);
  }

  async findOne(id: string) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }

    // Expose clean object without hash
    const { passwordHash, ...rest } = user;
    return rest;
  }

  async findByEmail(email: string) {
    return this.userRepository.findByEmail(email);
  }

  async findAll(page: number, limit: number, search?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
        { fullName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const { users, total } = await this.userRepository.findMany({
      skip,
      take: limit,
      where,
      orderBy: { createdAt: 'desc' },
    });

    const parsedUsers = users.map((u) => {
      const { passwordHash, ...rest } = u;
      return rest;
    });

    return {
      users: parsedUsers,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);

    const updateData: any = {};
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existing = await this.userRepository.findByEmail(updateUserDto.email);
      if (existing) {
        throw new ConflictException('Email already in use.');
      }
      updateData.email = updateUserDto.email;
    }

    if (updateUserDto.fullName) {
      updateData.fullName = updateUserDto.fullName;
    }

    if (updateUserDto.status) {
      updateData.status = updateUserDto.status;
    }

    if (updateUserDto.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.passwordHash = await bcrypt.hash(updateUserDto.password, salt);
    }

    await this.userRepository.update(id, updateData);

    if (updateUserDto.roleIds) {
      await this.userRepository.assignRoles(id, updateUserDto.roleIds);
    }

    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.userRepository.softDelete(id);
    return { id, message: 'User soft deleted successfully.' };
  }
}
