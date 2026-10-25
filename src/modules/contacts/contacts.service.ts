import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { pickFields } from '../../common/input';
@Injectable()
export class ContactsService {
  constructor(private prisma: PrismaService) {}
  findAll(workspaceId: string, companyId?: string) { return this.prisma.contact.findMany({ where: { company: { workspaceId }, ...(companyId ? { companyId } : {}) }, include: { company: true }, orderBy: { createdAt: 'desc' } }); }
  async findOne(id: string, workspaceId: string) { const row = await this.prisma.contact.findFirst({ where: { id, company: { workspaceId } }, include: { company: true, leads: true } }); if (!row) throw new NotFoundException('Contact not found'); return row; }
  async create(data: any, workspaceId: string) { const company = await this.prisma.company.findFirst({ where: { id: data.companyId, workspaceId } }); if (!company) throw new NotFoundException('Company not found'); return this.prisma.contact.create({ data: pickFields(data, ['companyId','name','role','phone','email','whatsapp']) as any, include: { company: true } }); }
  async update(id: string, data: any, workspaceId: string) { await this.findOne(id, workspaceId); if (data.companyId && !(await this.prisma.company.findFirst({ where: { id: data.companyId, workspaceId } }))) throw new NotFoundException('Company not found'); return this.prisma.contact.update({ where: { id }, data: pickFields(data, ['companyId','name','role','phone','email','whatsapp']), include: { company: true } }); }
  async remove(id: string, workspaceId: string) { await this.findOne(id, workspaceId); await this.prisma.contact.delete({ where: { id } }); return { deleted: true }; }
}
