import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { Permission, Prisma } from '@prisma/client';

@Injectable()
export class PermissionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Permission | null> {
    return this.prisma.permission.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });
  }

  async findByCode(code: string): Promise<Permission | null> {
    return this.prisma.permission.findFirst({
      where: {
        code,
        deletedAt: null,
      },
    });
  }

  async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.PermissionWhereInput;
  }): Promise<{ permissions: Permission[]; total: number }> {
    const { skip, take, where } = params;
    const finalWhere = {
      ...where,
      deletedAt: null,
    };

    const [permissions, total] = await Promise.all([
      this.prisma.permission.findMany({
        skip,
        take,
        where: finalWhere,
        orderBy: { code: 'asc' },
      }),
      this.prisma.permission.count({
        where: finalWhere,
      }),
    ]);

    return { permissions, total };
  }

  async getUserPermissions(userId: string): Promise<Permission[]> {
    const userRoles = await this.prisma.userRole.findMany({
      where: { userId },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    const permissionsMap = new Map<string, Permission>();
    for (const ur of userRoles) {
      if (ur.role && !ur.role.deletedAt) {
        for (const rp of ur.role.rolePermissions) {
          if (rp.permission && !rp.permission.deletedAt) {
            permissionsMap.set(rp.permission.code, rp.permission);
          }
        }
      }
    }

    return Array.from(permissionsMap.values());
  }
}
