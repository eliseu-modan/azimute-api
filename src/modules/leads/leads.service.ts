import { Injectable, NotFoundException } from '@nestjs/common';
import { LeadStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { pickFields } from '../../common/input';
@Injectable()
export class LeadsService {
  constructor(private prisma: PrismaService) {}
  async findAll(filters: any, workspaceId: string) {
    const page = Math.max(1, Number(filters.page) || 1), pageSize = Math.min(100, Math.max(1, Number(filters.pageSize) || 20));
    const where: any = { workspaceId };
    for (const key of ['status','assignedTo','stageId']) if (filters[key]) where[key] = filters[key];
    if (filters.search) where.OR = [{ name: { contains: String(filters.search), mode: 'insensitive' } }, { company: { name: { contains: String(filters.search), mode: 'insensitive' } } }, { email: { contains: String(filters.search), mode: 'insensitive' } }];
    const [data,total] = await Promise.all([this.prisma.lead.findMany({ where, skip: (page-1)*pageSize, take: pageSize, include: { company: true, contact: true, assignedUser: { select: { id: true, name: true, email: true } }, stage: true, _count: { select: { activities: true, proposals: true } } }, orderBy: { updatedAt: 'desc' } }), this.prisma.lead.count({ where })]);
    return { data, meta: { page, pageSize, total, totalPages: Math.ceil(total/pageSize) } };
  }
  async findOne(id: string, workspaceId: string) { const row = await this.prisma.lead.findFirst({ where: { id, workspaceId }, include: { company: true, contact: true, assignedUser: { select: { id: true, name: true, email: true } }, stage: true, activities: true, proposals: { include: { items: true } } } }); if (!row) throw new NotFoundException('Lead not found'); return row; }
  async create(data: any, workspaceId: string, userId: string) {
    const assignedTo = data.assignedTo || userId;
    const member = await this.prisma.membership.findFirst({ where: { userId: assignedTo, workspaceId, status: 'ACTIVE' } });
    if (!member) throw new NotFoundException('Assigned user not found in workspace');
    const stage = await this.prisma.pipelineStage.findFirst({ where: { id: data.stageId, workspaceId } });
    if (!stage) throw new NotFoundException('Pipeline stage not found');
    const lead = await this.prisma.lead.create({ data: { ...pickFields(data, ['companyId','contactId','stageId','source','score','status','estimatedValue','notes','name','phone','whatsapp','email','city','state','website','instagram','lastContactAt','nextContactAt']), workspaceId, assignedTo } as any });
    await this.audit(workspaceId, userId, lead.id, 'CREATE', null, lead);
    return lead;
  }
  async update(id: string, data: any, workspaceId: string, userId: string) {
    const before = await this.findOne(id, workspaceId);
    if (data.assignedTo && !(await this.prisma.membership.findFirst({ where: { userId: data.assignedTo, workspaceId, status: 'ACTIVE' } }))) throw new NotFoundException('Assigned user not found in workspace');
    if (data.stageId && !(await this.prisma.pipelineStage.findFirst({ where: { id: data.stageId, workspaceId } }))) throw new NotFoundException('Pipeline stage not found');
    const lead = await this.prisma.lead.update({ where: { id }, data: pickFields(data, ['companyId','contactId','assignedTo','stageId','source','score','status','estimatedValue','notes','name','phone','whatsapp','email','city','state','website','instagram','lastContactAt','nextContactAt']) as any });
    await this.audit(workspaceId, userId, id, before.status !== lead.status ? 'STATUS_CHANGED' : 'UPDATE', before, lead);
    return lead;
  }
  updateStatus(id: string, status: LeadStatus, workspaceId: string, userId: string) { return this.update(id, { status }, workspaceId, userId); }
  async convert(id: string, workspaceId: string, userId: string) {
    const lead = await this.findOne(id, workspaceId);
    const updated = await this.prisma.lead.update({ where: { id }, data: { status: 'CLIENT' } });
    await this.audit(workspaceId, userId, id, 'CONVERTED_TO_CLIENT', lead, updated);
    return { lead: updated, company: lead.company };
  }
  history(id: string, workspaceId: string) { return this.findOne(id, workspaceId).then(() => this.prisma.auditLog.findMany({ where: { workspaceId, leadId: id }, orderBy: { createdAt: 'desc' } })); }
  async remove(id: string, workspaceId: string, userId: string) { const before = await this.findOne(id, workspaceId); await this.prisma.lead.delete({ where: { id } }); await this.audit(workspaceId, userId, id, 'DELETE', before, null); return { deleted: true }; }
  private audit(workspaceId: string, userId: string, leadId: string, action: string, before: any, after: any) { return this.prisma.auditLog.create({ data: { workspaceId, userId, leadId, entityType: 'lead', entityId: leadId, action, before: before ? JSON.parse(JSON.stringify(before)) : undefined, after: after ? JSON.parse(JSON.stringify(after)) : undefined } }); }
}
