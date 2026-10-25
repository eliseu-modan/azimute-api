import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { pickFields } from '../../common/input';
@Injectable()
export class ProposalsService {
  constructor(private prisma: PrismaService) {}
  findAll(workspaceId: string, leadId?: string) {
    return this.prisma.proposal.findMany({ where: { workspaceId, ...(leadId ? { leadId } : {}) }, include: { lead: { include: { company: true } }, creator: { select: { id: true, name: true, email: true } }, items: true }, orderBy: { createdAt: 'desc' } });
  }
  async findOne(id: string, workspaceId: string) {
    const result = await this.prisma.proposal.findFirst({ where: { id, workspaceId }, include: { lead: { include: { company: true } }, creator: { select: { id: true, name: true } }, items: true, project: true } });
    if (!result) throw new NotFoundException('Proposal not found');
    return result;
  }
  async create(data: any, workspaceId: string, userId: string) {
    const lead = await this.prisma.lead.findFirst({ where: { id: data.leadId, workspaceId }, include: { company: true } });
    if (!lead) throw new NotFoundException('Lead not found');
    const items = Array.isArray(data.items) ? data.items : [];
    const total = items.reduce((sum: number, item: any) => sum + Number(item.quantity ?? 1) * Number(item.unitPrice), 0);
    return this.prisma.proposal.create({ data: { ...pickFields(data, ['leadId','status','description','validUntil','problem','solution','scope','deliverables','schedule','paymentTerms','notes']), workspaceId, createdBy: userId, value: total, items: { create: items.map((item: any) => pickFields(item, ['name','description','phase','quantity','unitPrice'])) } } as any, include: { items: true, lead: { include: { company: true } } } });
  }
  async update(id: string, workspaceId: string, data: any) {
    await this.findOne(id, workspaceId);
    return this.prisma.proposal.update({ where: { id }, data: pickFields(data, ['description','validUntil','problem','solution','scope','deliverables','schedule','paymentTerms','notes']), include: { items: true } });
  }
  async send(id: string, workspaceId: string) {
    await this.findOne(id, workspaceId);
    return this.prisma.proposal.update({ where: { id }, data: { status: 'SENT', sentAt: new Date() } });
  }
  async reject(id: string, workspaceId: string) {
    await this.findOne(id, workspaceId);
    return this.prisma.proposal.update({ where: { id }, data: { status: 'REJECTED' } });
  }
  async approve(id: string, workspaceId: string) {
    return this.prisma.$transaction(async (tx) => {
      const proposal = await tx.proposal.findFirst({ where: { id, workspaceId }, include: { lead: { include: { company: true } }, project: true } });
      if (!proposal) throw new NotFoundException('Proposal not found');
      if (proposal.project) throw new ConflictException('Project already exists for this proposal');
      const project = await tx.project.create({ data: { workspaceId, proposalId: id, companyId: proposal.lead.companyId, name: `Projeto - ${proposal.lead.company.name}`, description: proposal.scope ?? proposal.description, value: proposal.value, status: 'PLANNING' } });
      await tx.proposal.update({ where: { id }, data: { status: 'ACCEPTED', acceptedAt: new Date() } });
      await tx.lead.update({ where: { id: proposal.leadId }, data: { status: 'APPROVED' } });
      await tx.auditLog.create({ data: { workspaceId, entityType: 'proposal', entityId: id, action: 'APPROVE_AND_CREATE_PROJECT', after: { projectId: project.id } } });
      return { proposalId: id, project };
    });
  }
  async remove(id: string, workspaceId: string) { await this.findOne(id, workspaceId); await this.prisma.proposal.delete({ where: { id } }); return { deleted: true }; }
  async renderPdf(id: string, workspaceId: string): Promise<Buffer> {
    const proposal = await this.findOne(id, workspaceId);
    const lines = [
      'NEXO CRM - PROPOSTA',
      `Cliente: ${proposal.lead.company.name}`,
      `Lead: ${proposal.lead.name ?? proposal.lead.company.name}`,
      `Status: ${proposal.status}`,
      `Descricao: ${proposal.description ?? proposal.scope ?? '-'}`,
      ...proposal.items.map((item) => `${item.phase}: ${item.name} | ${item.quantity} x ${item.unitPrice}`),
      `Total: R$ ${proposal.value.toString()}`,
      `Validade: ${proposal.validUntil?.toISOString().slice(0, 10) ?? '-'}`,
    ];
    const clean = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\x20-\x7E]/g, '').replace(/[\\()]/g, (char) => `\\${char}`);
    const stream = `BT /F1 12 Tf 50 780 Td ${lines.map((line, index) => `${index ? '0 -20 Td ' : ''}(${clean(line)}) Tj`).join(' ')} ET`;
    const objects = [
      '<< /Type /Catalog /Pages 2 0 R >>',
      '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
      '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
      '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
      `<< /Length ${Buffer.byteLength(stream, 'ascii')} >>\nstream\n${stream}\nendstream`,
    ];
    let pdf = '%PDF-1.4\n';
    const offsets = [0];
    objects.forEach((object, index) => { offsets.push(Buffer.byteLength(pdf, 'ascii')); pdf += `${index + 1} 0 obj\n${object}\nendobj\n`; });
    const xrefOffset = Buffer.byteLength(pdf, 'ascii');
    pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.slice(1).map((offset) => `${String(offset).padStart(10, '0')} 00000 n \n`).join('')}trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
    return Buffer.from(pdf, 'ascii');
  }
}

