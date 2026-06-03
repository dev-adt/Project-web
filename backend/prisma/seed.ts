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

  console.log('Seeding default templates...');
  const templates = [
    {
      name: 'Healthcare Template',
      description: 'Landing page template tailored for doctors, clinics, and health assistants',
      thumbnail: '/templates/healthcare.png',
      sections: [
        {
          sectionType: 'Hero',
          position: 0,
          settingsJson: {
            title: 'Chăm sóc sức khỏe gia đình bạn',
            subtitle: 'Hệ thống hỗ trợ sức khỏe thông minh và kết nối bác sĩ 24/7.',
            buttonText: 'Đăng ký ngay',
            bgImage: '/images/health-bg.jpg',
          },
        },
        {
          sectionType: 'Features',
          position: 1,
          settingsJson: {
            title: 'Dịch vụ nổi bật',
            featuresList: [
              { title: 'Tư vấn từ xa', description: 'Trò chuyện trực tiếp với bác sĩ chuyên khoa mọi lúc.' },
              { title: 'Hồ sơ bệnh án điện tử', description: 'Lưu trữ thông tin sức khỏe an toàn và bảo mật.' },
            ],
          },
        },
        {
          sectionType: 'CTA',
          position: 2,
          settingsJson: {
            title: 'Sẵn sàng chăm sóc sức khỏe tốt hơn?',
            buttonText: 'Liên hệ tư vấn',
          },
        },
      ],
    },
    {
      name: 'Education Template',
      description: 'Landing page template for schools, online courses, and bootcamps',
      thumbnail: '/templates/education.png',
      sections: [
        {
          sectionType: 'Hero',
          position: 0,
          settingsJson: {
            title: 'Chinh phục tri thức mới',
            subtitle: 'Học tập trực tuyến với lộ trình cá nhân hóa và giảng viên hàng đầu.',
            buttonText: 'Bắt đầu học',
            bgImage: '/images/edu-bg.jpg',
          },
        },
        {
          sectionType: 'Features',
          position: 1,
          settingsJson: {
            title: 'Tại sao chọn chúng tôi?',
            featuresList: [
              { title: 'Giảng viên kinh nghiệm', description: 'Đội ngũ chuyên gia từ các trường đại học hàng đầu.' },
              { title: 'Lộ trình linh hoạt', description: 'Tự học mọi lúc mọi nơi theo lịch trình cá nhân.' },
            ],
          },
        },
        {
          sectionType: 'CTA',
          position: 2,
          settingsJson: {
            title: 'Khởi đầu tương lai ngay hôm nay',
            buttonText: 'Đăng ký khóa học',
          },
        },
      ],
    },
    {
      name: 'Business Template',
      description: 'Corporate and agency business landing page',
      thumbnail: '/templates/business.png',
      sections: [
        {
          sectionType: 'Hero',
          position: 0,
          settingsJson: {
            title: 'Đột phá doanh thu của bạn',
            subtitle: 'Giải pháp chuyển đổi số toàn diện cho doanh nghiệp vừa và nhỏ.',
            buttonText: 'Tư vấn giải pháp',
          },
        },
        {
          sectionType: 'Features',
          position: 1,
          settingsJson: {
            title: 'Thế mạnh giải pháp',
            featuresList: [
              { title: 'Tự động hóa quy trình', description: 'Giảm thiểu sai sót và tăng tốc hiệu quả vận hành.' },
              { title: 'Báo cáo thông minh', description: 'Theo dõi trực quan mọi chỉ số kinh doanh theo thời gian thực.' },
            ],
          },
        },
      ],
    },
    {
      name: 'Event Template',
      description: 'Conferences, workshops, and webinars landing page',
      thumbnail: '/templates/event.png',
      sections: [
        {
          sectionType: 'Hero',
          position: 0,
          settingsJson: {
            title: 'Hội nghị công nghệ 2026',
            subtitle: 'Cập nhật những xu hướng công nghệ mới nhất cùng các chuyên gia toàn cầu.',
            buttonText: 'Mua vé ngay',
          },
        },
      ],
    },
    {
      name: 'Nonprofit Template',
      description: 'Charity and nonprofit organizations landing page',
      thumbnail: '/templates/nonprofit.png',
      sections: [
        {
          sectionType: 'Hero',
          position: 0,
          settingsJson: {
            title: 'Chung tay vì cộng đồng',
            subtitle: 'Mỗi sự đóng góp nhỏ bé của bạn đều tạo nên sự thay đổi to lớn.',
            buttonText: 'Quyên góp ngay',
          },
        },
      ],
    },
    {
      name: 'Family Clan Template',
      description: 'Landing page for family clans and genealogies',
      thumbnail: '/templates/clan.png',
      sections: [
        {
          sectionType: 'Hero',
          position: 0,
          settingsJson: {
            title: 'Gia phả dòng họ trực tuyến',
            subtitle: 'Kết nối các thế hệ, lưu giữ truyền thống và tôn vinh nguồn cội.',
            buttonText: 'Xem gia phả',
          },
        },
      ],
    },
  ];

  for (const temp of templates) {
    const existing = await prisma.template.findFirst({
      where: { name: temp.name },
    });
    if (!existing) {
      const createdTemplate = await prisma.template.create({
        data: {
          name: temp.name,
          description: temp.description,
          thumbnail: temp.thumbnail,
        },
      });
      for (const sec of temp.sections) {
        await prisma.templateSection.create({
          data: {
            templateId: createdTemplate.id,
            sectionType: sec.sectionType,
            position: sec.position,
            settingsJson: sec.settingsJson,
          },
        });
      }
    }
  }

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

