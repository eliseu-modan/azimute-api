import { Injectable } from '@nestjs/common';
import { LeadStatus, ProposalStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { DashboardResponseDto } from './dto/dashboard-response.dto';
@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}
  async summary(workspaceId: string): Promise<DashboardResponseDto> {
    const [companies, contacts, leads, openLeads, wonLeads, activities, proposals, pipeline, recentLeads, upcomingActivities, acceptedProposals] = await Promise.all([
      this.prisma.company.count({ where: { workspaceId } }),
      this.prisma.contact.count({ where: { company: { workspaceId } } }),
      this.prisma.lead.count({ where: { workspaceId } }),
      this.prisma.lead.count({ where: { workspaceId, status: { notIn: [LeadStatus.WON, LeadStatus.CLIENT, LeadStatus.LOST, LeadStatus.REJECTED] } } }),
      this.prisma.lead.count({ where: { workspaceId, status: { in: [LeadStatus.WON, LeadStatus.CLIENT] } } }),
      this.prisma.activity.count({ where: { lead: { workspaceId } } }),
      this.prisma.proposal.count({ where: { workspaceId } }),
      this.prisma.pipelineStage.findMany({ where: { workspaceId }, include: { _count: { select: { leads: true } } }, orderBy: { order: 'asc' } }),
      this.prisma.lead.findMany({ where: { workspaceId }, take: 5, orderBy: { createdAt: 'desc' }, include: { company: true, stage: true } }),
      this.prisma.activity.findMany({ where: { scheduledAt: { gte: new Date() }, completedAt: null, lead: { workspaceId } }, take: 5, orderBy: { scheduledAt: 'asc' }, include: { lead: { include: { company: true } } } }),
      this.prisma.proposal.count({ where: { workspaceId, status: ProposalStatus.ACCEPTED } }),
    ]);
    return { totals: { companies, contacts, leads, openLeads, wonLeads, activities, proposals, acceptedProposals }, pipeline, recentLeads, upcomingActivities };
  }
  pipeline(workspaceId: string) { return this.prisma.pipelineStage.findMany({ where: { workspaceId }, include: { _count: { select: { leads: true } } }, orderBy: { order: 'asc' } }); }
  leadSources(workspaceId: string) { return this.prisma.lead.groupBy({ by: ['source'], where: { workspaceId }, _count: { _all: true } }); }
}
