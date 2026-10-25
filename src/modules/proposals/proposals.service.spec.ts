import { ProposalsService } from './proposals.service';

describe('ProposalsService', () => {
  it('approves a proposal and creates exactly one project in a transaction', async () => {
    const tx: any = {
      proposal: { findFirst: jest.fn().mockResolvedValue({ id: 'p1', leadId: 'l1', value: 100, lead: { companyId: 'c1', company: { name: 'Acme' } }, project: null }), update: jest.fn().mockResolvedValue({}) },
      project: { create: jest.fn().mockResolvedValue({ id: 'project-1' }) },
      lead: { update: jest.fn().mockResolvedValue({}) },
      auditLog: { create: jest.fn().mockResolvedValue({}) },
    };
    const prisma: any = { $transaction: jest.fn((callback) => callback(tx)) };
    const service = new ProposalsService(prisma);
    const result = await service.approve('p1', 'w1');
    expect(result.project.id).toBe('project-1');
    expect(tx.project.create).toHaveBeenCalledTimes(1);
    expect(tx.proposal.update.mock.calls[0][0].data.status).toBe('ACCEPTED');
    expect(tx.auditLog.create).toHaveBeenCalledTimes(1);
  });
});
