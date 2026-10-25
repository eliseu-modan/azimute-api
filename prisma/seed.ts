import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});
async function main() {
  const workspace = await prisma.workspace.upsert({
    where: { slug: 'default' },
    update: {},
    create: {
      id: 'default',
      name: process.env.WORKSPACE_NAME || 'Nexo CRM',
      slug: 'default',
    },
  });
  const adminRole = await prisma.role.upsert({
    where: { key: 'ADMIN' },
    update: {},
    create: { name: 'Administrador', key: 'ADMIN' },
  });
  const userRole = await prisma.role.upsert({
    where: { key: 'USER' },
    update: {},
    create: { name: 'Usuário', key: 'USER' },
  });
  const permissions = [
    'users.read',
    'users.write',
    'leads.read',
    'leads.write',
    'companies.read',
    'companies.write',
    'surveys.read',
    'surveys.write',
    'requirements.read',
    'requirements.write',
    'projects.read',
    'projects.write',
    'settings.write',
    'audit.read',
  ];
  for (const key of permissions) {
    const permission = await prisma.permission.upsert({
      where: { key },
      update: {},
      create: { key },
    });
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: { roleId: adminRole.id, permissionId: permission.id },
    });
  }
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (email && password) {
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        name: process.env.ADMIN_NAME || 'Administrador',
        email,
        password: await bcrypt.hash(password, 12),
        role: 'ADMIN',
      },
    });
    await prisma.membership.upsert({
      where: {
        userId_workspaceId: { userId: user.id, workspaceId: workspace.id },
      },
      update: { status: 'ACTIVE', roleId: adminRole.id },
      create: {
        userId: user.id,
        workspaceId: workspace.id,
        roleId: adminRole.id,
      },
    });
  }
  void userRole;
}
main().finally(() => prisma.$disconnect());
