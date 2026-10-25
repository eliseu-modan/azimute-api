import { createHash } from 'node:crypto';
import { CanActivate, createParamDecorator, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface AuthUser { sub: string; email: string; role: string; workspaceId: string }
export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext) => ctx.switchToHttp().getRequest().user as AuthUser);
export const SESSION_COOKIE = 'nexo_session';
export const hashSessionToken = (token: string) => createHash('sha256').update(token).digest('hex');

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const cookie = (request.headers.cookie ?? '').split(';').map((part: string) => part.trim()).find((part: string) => part.startsWith(`${SESSION_COOKIE}=`));
    const token = cookie?.slice(SESSION_COOKIE.length + 1);
    if (!token) throw new UnauthorizedException('Session required');
    const session = await this.prisma.session.findUnique({ where: { tokenHash: hashSessionToken(decodeURIComponent(token)) }, include: { user: { include: { memberships: { where: { status: 'ACTIVE' }, include: { role: true } } } } } });
    if (!session || session.revokedAt || session.expiresAt <= new Date()) throw new UnauthorizedException('Session invalid or expired');
    const membership = session.user.memberships.find((item) => item.workspaceId === session.workspaceId);
    if (!membership || session.user.status !== 'ACTIVE') throw new UnauthorizedException('Workspace membership is inactive');
    request.user = { sub: session.userId, email: session.user.email, role: membership.role.key, workspaceId: session.workspaceId } satisfies AuthUser;
    return true;
  }
}
