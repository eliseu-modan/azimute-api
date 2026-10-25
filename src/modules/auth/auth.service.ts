import { Injectable, UnauthorizedException } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { hashSessionToken } from '../../common/auth';
import { verifyPassword } from '../../common/password';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async login(email: string, password: string, workspaceSlug?: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      include: {
        memberships: {
          where: { status: 'ACTIVE' },
          include: { workspace: true, role: true },
        },
      },
    });
    const validPassword = user
      ? user.password.startsWith('$2')
        ? await bcrypt.compare(password, user.password)
        : await verifyPassword(password, user.password)
      : false;
    if (!user || user.status !== 'ACTIVE' || !validPassword)
      throw new UnauthorizedException('Invalid email or password');
    if (!user.password.startsWith('$2'))
      await this.prisma.user.update({
        where: { id: user.id },
        data: { password: await bcrypt.hash(password, 12) },
      });
    const membership = user.memberships.find(
      (item) => !workspaceSlug || item.workspace.slug === workspaceSlug,
    );
    if (!membership) throw new UnauthorizedException('No access to workspace');
    const token = randomBytes(32).toString('base64url');
    await this.prisma.session.create({
      data: {
        tokenHash: hashSessionToken(token),
        userId: user.id,
        workspaceId: membership.workspaceId,
        expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000),
      },
    });
    return {
      token,
      user: { id: user.id, name: user.name, email: user.email },
      role: membership.role.key,
      workspace: {
        id: membership.workspace.id,
        name: membership.workspace.name,
        slug: membership.workspace.slug,
      },
    };
  }

  async logout(token?: string) {
    if (token)
      await this.prisma.session.updateMany({
        where: { tokenHash: hashSessionToken(token), revokedAt: null },
        data: { revokedAt: new Date() },
      });
    return { success: true };
  }

  async getSession(userId: string, workspaceId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        memberships: {
          where: { workspaceId, status: 'ACTIVE' },
          select: {
            role: { select: { key: true } },
            workspace: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    });
  }

  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const validPassword = user
      ? user.password.startsWith('$2')
        ? await bcrypt.compare(oldPassword, user.password)
        : await verifyPassword(oldPassword, user.password)
      : false;
    if (!user || !validPassword)
      throw new UnauthorizedException('Invalid current password');
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: { password: await bcrypt.hash(newPassword, 12) },
      }),
      this.prisma.session.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);
    return { success: true };
  }
}
