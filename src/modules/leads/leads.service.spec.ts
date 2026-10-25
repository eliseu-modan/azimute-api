import { LeadsService } from './leads.service';

describe('LeadsService', () => {
  it('converts a workspace lead and writes a conversion audit entry', async () => {
    const lead = { id: 'l1', status: 'QUALIFICATION', company: { id: 'c1', name: 'Acme' } };
    const prisma: any = {
      lead: { findFirst: jest.fn().mockResolvedValue(lead), update: jest.fn().mockResolvedValue({ ...lead, status: 'CLIENT' }) },
      auditLog: { create: jest.fn().mockResolvedValue({}) },
    };
    const service = new LeadsService(prisma);
    const result = await service.convert('l1', 'w1', 'u1');
    expect(result.lead.status).toBe('CLIENT');
    expect(result.company).toEqual(lead.company);
    expect(prisma.lead.update).toHaveBeenCalledWith({ where: { id: 'l1' }, data: { status: 'CLIENT' } });
    expect(prisma.auditLog.create.mock.calls[0][0].data.action).toBe('CONVERTED_TO_CLIENT');
  });
});
