import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { Prisma, Role } from '@prisma/client';

@Injectable()
export class RoleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Role | null> {
    return this.prisma.role.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  }

  async findByName(name: string): Promise<Role | null> {
    return this.prisma.role.findFirst({
      where: {
        name,
        deletedAt: null,
      },
    });
  }

  async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.RoleWhereInput;
  }): Promise<{ roles: Role[]; total: number }> {
    const { skip, take, where } = params;
    const finalWhere = {
      ...where,
      deletedAt: null,
    };

    const [roles, total] = await Promise.all([
      this.prisma.role.findMany({
        skip,
        take,
        where: finalWhere,
        include: {
          rolePermissions: {
            include: {
              permission: true,
            },
          },
        },
      }),
      this.prisma.role.count({
        where: finalWhere,
      }),
    ]);

    return { roles, total };
  }

  async create(data: Prisma.RoleCreateInput): Promise<Role> {
    return this.prisma.role.create({
      data,
    });
  }

  async update(id: string, data: Prisma.RoleUpdateInput): Promise<Role> {
    return this.prisma.role.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: string): Promise<Role> {
    return this.prisma.role.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async assignPermissions(roleId: string, permissionIds: string[]): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      // Clear current assignments
      await tx.rolePermission.deleteMany({
        where: { roleId },
      });

      // Bulk create new entries
      if (permissionIds && permissionIds.length > 0) {
        await tx.rolePermission.createMany({
          data: permissionIds.map((permissionId) => ({
            roleId,
            permissionId,
          })),
        });
      }
    });
  }
}
