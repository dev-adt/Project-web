import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding system permissions...');

  const permissionList = [
    // Pages permissions
    { code: 'pages.create', name: 'Create Pages', description: 'Create new landing pages' },
    { code: 'pages.edit', name: 'Edit Pages', description: 'Edit page settings and section layouts' },
    { code: 'pages.delete', name: 'Delete Pages', description: 'Archive and soft-delete landing pages' },
    { code: 'pages.publish', name: 'Publish Pages', description: 'Publish landing pages' },
    
    // Media permissions
    { code: 'media.upload', name: 'Upload Media', description: 'Upload static file assets to object storage' },
    { code: 'media.delete', name: 'Delete Media', description: 'Delete uploaded media files' },
    
    // User permissions
    { code: 'users.create', name: 'Create Users', description: 'Register new system operators' },
    { code: 'users.edit', name: 'Edit Users', description: 'Modify profiles and edit user roles' },
    { code: 'users.delete', name: 'Delete Users', description: 'Revoke user credentials' },
  ];

  const dbPermissions = [];
  for (const perm of permissionList) {
    const p = await prisma.permission.upsert({
      where: { code: perm.code },
      update: {},
      create: {
        code: perm.code,
        name: perm.name,
        description: perm.description,
      },
    });
    dbPermissions.push(p);
  }

  console.log('Seeding roles...');
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: {
      name: 'ADMIN',
      description: 'System administrator with unrestricted credentials',
    },
  });

  const editorRole = await prisma.role.upsert({
    where: { name: 'EDITOR' },
    update: {},
    create: {
      name: 'EDITOR',
      description: 'Page editor who can create, adjust, and publish layout contents',
    },
  });

  const creatorRole = await prisma.role.upsert({
    where: { name: 'CONTENT_CREATOR' },
    update: {},
    create: {
      name: 'CONTENT_CREATOR',
      description: 'Creator who writes draft entries and uploads media assets',
    },
  });

  console.log('Wiring up role-permission relationships...');
  // 1. Admin gets all permissions
  for (const perm of dbPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: perm.id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: perm.id,
      },
    });
  }

  // 2. Editor gets pages and media permissions
  const editorPerms = dbPermissions.filter(
    (p) => p.code.startsWith('pages.') || p.code.startsWith('media.'),
  );
  for (const perm of editorPerms) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: editorRole.id,
          permissionId: perm.id,
        },
      },
      update: {},
      create: {
        roleId: editorRole.id,
        permissionId: perm.id,
      },
    });
  }

  // 3. Content Creator gets pages.create, pages.edit, media.upload
  const creatorPermCodes = ['pages.create', 'pages.edit', 'media.upload'];
  const creatorPerms = dbPermissions.filter((p) => creatorPermCodes.includes(p.code));
  for (const perm of creatorPerms) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: creatorRole.id,
          permissionId: perm.id,
        },
      },
      update: {},
      create: {
        roleId: creatorRole.id,
        permissionId: perm.id,
      },
    });
  }

  console.log('Seeding default administrator account...');
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('password', salt);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      username: 'admin',
      fullName: 'System Administrator',
      passwordHash: passwordHash,
      status: 'active',
    },
  });

  // Assign ADMIN role to the admin user
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: adminRole.id,
    },
  });

  console.log('Database seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
