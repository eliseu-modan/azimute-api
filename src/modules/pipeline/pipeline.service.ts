import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { pickFields } from '../../common/input';
@Injectable()
export class PipelineService {
  constructor(private prisma: PrismaService) {}
  findAll(workspaceId: string) { return this.prisma.pipelineStage.findMany({ where: { workspaceId }, include: { _count: { select: { leads: true } } }, orderBy: { order: 'asc' } }); }
  async findOne(id: string, workspaceId: string) { const stage = await this.prisma.pipelineStage.findFirst({ where: { id, workspaceId }, include: { leads: true } }); if (!stage) throw new NotFoundException('Stage not found'); return stage; }
  create(data: any, workspaceId: string) { return this.prisma.pipelineStage.create({ data: { ...pickFields(data, ['name','order','color']), workspaceId } as any }); }
  async update(id: string, data: any, workspaceId: string) { await this.findOne(id, workspaceId); return this.prisma.pipelineStage.update({ where: { id }, data: pickFields(data, ['name','order','color']) }); }
  async remove(id: string, workspaceId: string) { await this.findOne(id, workspaceId); await this.prisma.pipelineStage.delete({ where: { id } }); return { deleted: true }; }
}
