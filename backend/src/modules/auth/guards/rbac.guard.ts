import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { PermissionRepository } from '../../permissions/repositories/permission.repository';

@Injectable()
export class RbacGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private permissionRepository: PermissionRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no permission metadata is set, allow access
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return false;
    }

    // Auto-bypass for ADMIN role
    const userRoles: string[] = user.userRoles?.map((ur: any) => ur.role.name) || [];
    if (userRoles.includes('ADMIN')) {
      return true;
    }

    // Fetch user permissions from database
    const userPermissions = await this.permissionRepository.getUserPermissions(user.id);
    const userPermissionCodes = userPermissions.map((p) => p.code);

    // Verify user has all required permissions
    const hasPermission = requiredPermissions.every((perm) =>
      userPermissionCodes.includes(perm),
    );

    if (!hasPermission) {
      throw new ForbiddenException('Insufficient permissions to execute this operation.');
    }

    return true;
  }
}
