import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { pickFields } from '../../common/input';
@Injectable()
export class CompaniesService {
  constructor(private prisma: PrismaService) {}
  async findAll(workspaceId: string, query: any = {}) {
    const page = Math.max(1, Number(query.page) || 1), pageSize = Math.min(100, Math.max(1, Number(query.pageSize) || 20));
    const where: any = { workspaceId };
    if (query.search) where.OR = ['name','legalName','tradeName','segment'].map((field) => ({ [field]: { contains: String(query.search), mode: 'insensitive' } }));
    const [data,total] = await Promise.all([this.prisma.company.findMany({ where, include: { _count: { select: { contacts: true, leads: true } } }, skip: (page-1)*pageSize, take: pageSize, orderBy: { createdAt: 'desc' } }), this.prisma.company.count({ where })]);
    return { data, meta: { page, pageSize, total, totalPages: Math.ceil(total/pageSize) } };
  }
  async findOne(id: string, workspaceId: string) { const row = await this.prisma.company.findFirst({ where: { id, workspaceId }, include: { contacts: true, leads: true } }); if (!row) throw new NotFoundException('Company not found'); return row; }
  create(data: any, workspaceId: string) { return this.prisma.company.create({ data: { ...pickFields(data, ['name','legalName','tradeName','document','segment','website','instagram','phone','email','city','state','notes','yearsInBusiness','employeeCount']), workspaceId } as any }); }
  async update(id: string, workspaceId: string, data: any) { await this.findOne(id, workspaceId); return this.prisma.company.update({ where: { id }, data: pickFields(data, ['name','legalName','tradeName','document','segment','website','instagram','phone','email','city','state','notes','yearsInBusiness','employeeCount']) }); }
  async remove(id: string, workspaceId: string) { await this.findOne(id, workspaceId); await this.prisma.company.delete({ where: { id } }); return { deleted: true }; }
}
