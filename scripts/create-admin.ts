/**
 * Create Initial Admin User
 * Run with: npx tsx scripts/create-admin.ts
 */

import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../lib/password';

const prisma = new PrismaClient();

async function main() {
  console.log('🔐 Creating admin user and roles...\n');

  // Create admin role first
  console.log('Creating admin role...');
  const adminRole = await prisma.adminRole.upsert({
    where: { code: 'super_admin' },
    update: {},
    create: {
      code: 'super_admin',
      nameTh: 'ผู้ดูแลระบบ',
      nameEn: 'Super Administrator',
      permissions: JSON.stringify([
        // All permissions
        'trains:view',
        'trains:create',
        'trains:update',
        'trains:delete',
        'stations:view',
        'stations:create',
        'stations:update',
        'stations:delete',
        'pricing:view',
        'pricing:create',
        'pricing:update',
        'pricing:delete',
        'announcements:view',
        'announcements:create',
        'announcements:update',
        'announcements:delete',
        'users:view',
        'users:create',
        'users:update',
        'users:delete',
        'system:admin',
      ]),
      isActive: true,
    },
  });
  console.log('✅ Admin role created:', adminRole.nameTh);

  // Create editor role
  console.log('\nCreating editor role...');
  const editorRole = await prisma.adminRole.upsert({
    where: { code: 'editor' },
    update: {},
    create: {
      code: 'editor',
      nameTh: 'ผู้แก้ไข',
      nameEn: 'Editor',
      permissions: JSON.stringify([
        'trains:view',
        'trains:create',
        'trains:update',
        'stations:view',
        'pricing:view',
        'pricing:update',
        'announcements:view',
        'announcements:create',
        'announcements:update',
      ]),
      isActive: true,
    },
  });
  console.log('✅ Editor role created:', editorRole.nameTh);

  // Create viewer role
  console.log('\nCreating viewer role...');
  const viewerRole = await prisma.adminRole.upsert({
    where: { code: 'viewer' },
    update: {},
    create: {
      code: 'viewer',
      nameTh: 'ผู้ดู',
      nameEn: 'Viewer',
      permissions: JSON.stringify([
        'trains:view',
        'stations:view',
        'pricing:view',
        'announcements:view',
      ]),
      isActive: true,
    },
  });
  console.log('✅ Viewer role created:', viewerRole.nameTh);

  // Create default admin user
  console.log('\nCreating default admin user...');
  const hashedPassword = await hashPassword('Admin123!');

  const adminUser = await prisma.adminUser.upsert({
    where: { username: 'admin' },
    update: {
      passwordHash: hashedPassword,
      roleId: adminRole.id,
      isActive: true,
    },
    create: {
      username: 'admin',
      email: 'admin@srt.or.th',
      passwordHash: hashedPassword,
      fullName: 'System Administrator',
      phone: '+66-2-220-4444',
      roleId: adminRole.id,
      isActive: true,
    },
  });

  console.log('✅ Admin user created:', adminUser.username);
  console.log('\n📋 Login Credentials:');
  console.log('   Username: admin');
  console.log('   Email: admin@srt.or.th');
  console.log('   Password: Admin123!');
  console.log('   Role:', adminRole.nameTh);

  console.log('\n✅ Setup complete!\n');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
