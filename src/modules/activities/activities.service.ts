import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { pickFields } from '../../common/input';
@Injectable()
export class ActivitiesService {
  constructor(private prisma: PrismaService) {}
  findAll(workspaceId: string, leadId?: string) { return this.prisma.activity.findMany({ where: { lead: { workspaceId }, ...(leadId ? { leadId } : {}) }, include: { lead: { include: { company: true } }, user: { select: { id: true, name: true, email: true } } }, orderBy: [{ scheduledAt: 'asc' }, { createdAt: 'desc' }] }); }
  async findOne(id: string, workspaceId: string) { const row = await this.prisma.activity.findFirst({ where: { id, lead: { workspaceId } }, include: { lead: true, user: { select: { id: true, name: true } } } }); if (!row) throw new NotFoundException('Activity not found'); return row; }
  async create(data: any, workspaceId: string, userId: string) { const lead = await this.prisma.lead.findFirst({ where: { id: data.leadId, workspaceId } }); if (!lead) throw new NotFoundException('Lead not found'); return this.prisma.activity.create({ data: { ...pickFields(data, ['leadId','type','title','description','scheduledAt','completedAt']), userId } as any, include: { lead: true } }); }
  async update(id: string, data: any, workspaceId: string) { await this.findOne(id, workspaceId); if (data.leadId && !(await this.prisma.lead.findFirst({ where: { id: data.leadId, workspaceId } }))) throw new NotFoundException('Lead not found'); return this.prisma.activity.update({ where: { id }, data: pickFields(data, ['leadId','type','title','description','scheduledAt','completedAt']), include: { lead: true } }); }
  async remove(id: string, workspaceId: string) { await this.findOne(id, workspaceId); await this.prisma.activity.delete({ where: { id } }); return { deleted: true }; }
}
