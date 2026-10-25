import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { pickFields } from '../../common/input';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}
  findAll(workspaceId: string) {
    return this.prisma.user.findMany({ where: { memberships: { some: { workspaceId, status: 'ACTIVE' } } }, select: { id: true, name: true, email: true, status: true, memberships: { where: { workspaceId }, select: { role: { select: { key: true } } } }, createdAt: true, updatedAt: true }, orderBy: { createdAt: 'desc' } });
  }
  async findOne(id: string, workspaceId: string) {
    const user = await this.prisma.user.findFirst({ where: { id, memberships: { some: { workspaceId, status: 'ACTIVE' } } }, select: { id: true, name: true, email: true, status: true, memberships: { where: { workspaceId }, select: { role: { select: { key: true } } } }, createdAt: true, updatedAt: true } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
  async create(data: any, workspaceId: string) {
    const roleKey = data.role === 'ADMIN' ? 'ADMIN' : 'USER';
    const role = await this.prisma.role.findUniqueOrThrow({ where: { key: roleKey } });
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({ data: { name: data.name, email: String(data.email).toLowerCase(), password: await bcrypt.hash(data.password, 12), role: roleKey === 'ADMIN' ? UserRole.ADMIN : UserRole.USER } });
      await tx.membership.create({ data: { userId: user.id, workspaceId, roleId: role.id } });
      return { id: user.id, name: user.name, email: user.email, role: role.key, createdAt: user.createdAt };
    });
  }
  async update(id: string, data: any, workspaceId: string) {
    await this.findOne(id, workspaceId);
    const roleKey = data.role ? (data.role === 'ADMIN' ? 'ADMIN' : 'USER') : undefined;
    const payload: any = pickFields(data, ['name', 'email', 'status']);
    if (payload.email) payload.email = String(payload.email).toLowerCase();
    if (data.password) payload.password = await bcrypt.hash(data.password, 12);
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.update({ where: { id }, data: payload, select: { id: true, name: true, email: true, status: true, updatedAt: true } });
      
      if (roleKey) {
        const role = await tx.role.findUniqueOrThrow({ where: { key: roleKey } });
        await tx.membership.update({ where: { userId_workspaceId: { userId: id, workspaceId } }, data: { roleId: role.id } });
        await tx.user.update({ where: { id }, data: { role: roleKey === 'ADMIN' ? UserRole.ADMIN : UserRole.USER } });
      }
      return { ...user, role: roleKey };
    });
  }
  async remove(id: string, workspaceId: string) {
    await this.findOne(id, workspaceId);
    await this.prisma.membership.delete({ where: { userId_workspaceId: { userId: id, workspaceId } } });
    return { deleted: true };
  }
  async updateRole(id: string, workspaceId: string, roleKey: string) {
    if (!['ADMIN', 'USER'].includes(roleKey)) throw new NotFoundException('Role not found');
    await this.findOne(id, workspaceId);
    const role = await this.prisma.role.findUniqueOrThrow({ where: { key: roleKey } });
    return this.prisma.$transaction(async (tx) => {
      const membership = await tx.membership.update({ where: { userId_workspaceId: { userId: id, workspaceId } }, data: { roleId: role.id }, include: { role: true } });
      await tx.user.update({ where: { id }, data: { role: roleKey as UserRole } });
      return membership;
    });
  }
}


