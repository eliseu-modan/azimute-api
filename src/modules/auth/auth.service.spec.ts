import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';

describe('AuthService session login', () => {
  it('creates an opaque session for an active workspace membership without returning a bearer token', async () => {
    const password = await bcrypt.hash('StrongPassword1!', 4);
    const prisma: any = {
      user: { findUnique: jest.fn().mockResolvedValue({ id: 'u1', email: 'user@example.com', name: 'User', password, status: 'ACTIVE', memberships: [{ workspaceId: 'w1', workspace: { id: 'w1', name: 'Workspace', slug: 'default' }, role: { key: 'USER' } }] }) },
      session: { create: jest.fn().mockResolvedValue({}) },
    };
    const service = new AuthService(prisma);
    const result = await service.login(' USER@example.com ', 'StrongPassword1!');
    expect(result.token).toHaveLength(43);
    expect(result.user.email).toBe('user@example.com');
    expect(result).not.toHaveProperty('accessToken');
    expect(prisma.session.create.mock.calls[0][0].data.tokenHash).not.toBe(result.token);
  });
});
