import { Injectable } from '@nestjs/common';
import { PermissionRepository } from '../repositories/permission.repository';

@Injectable()
export class PermissionsService {
  constructor(private readonly permissionRepository: PermissionRepository) {}

  async findAll() {
    const { permissions } = await this.permissionRepository.findMany({});
    return permissions;
  }

  async getUserPermissions(userId: string) {
    return this.permissionRepository.getUserPermissions(userId);
  }
}
