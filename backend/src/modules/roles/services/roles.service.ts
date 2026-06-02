import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { RoleRepository } from '../repositories/role.repository';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(private readonly roleRepository: RoleRepository) {}

  async create(createRoleDto: CreateRoleDto) {
    const existing = await this.roleRepository.findByName(createRoleDto.name.toUpperCase());
    if (existing) {
      throw new ConflictException(`Role with name ${createRoleDto.name} already exists.`);
    }

    return this.roleRepository.create({
      name: createRoleDto.name.toUpperCase(),
      description: createRoleDto.description,
    });
  }

  async findAll() {
    const { roles } = await this.roleRepository.findMany({});
    return roles;
  }

  async findOne(id: string) {
    const role = await this.roleRepository.findById(id);
    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found.`);
    }
    return role;
  }

  async update(id: string, updateRoleDto: UpdateRoleDto) {
    const role = await this.findOne(id);

    const updateData: any = {};
    if (updateRoleDto.name && updateRoleDto.name.toUpperCase() !== role.name) {
      const existing = await this.roleRepository.findByName(updateRoleDto.name.toUpperCase());
      if (existing) {
        throw new ConflictException(`Role with name ${updateRoleDto.name} already exists.`);
      }
      updateData.name = updateRoleDto.name.toUpperCase();
    }

    if (updateRoleDto.description) {
      updateData.description = updateRoleDto.description;
    }

    return this.roleRepository.update(id, updateData);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.roleRepository.softDelete(id);
    return { id, message: 'Role soft deleted successfully.' };
  }

  async assignPermissions(roleId: string, permissionIds: string[]) {
    await this.findOne(roleId);
    await this.roleRepository.assignPermissions(roleId, permissionIds);
    return this.findOne(roleId);
  }
}
