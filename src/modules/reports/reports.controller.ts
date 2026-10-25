import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, CurrentUser, AuthUser } from '../../common/auth';
import { DomainService } from '../../common/domain.service';
@Controller('reports') @UseGuards(JwtAuthGuard)
export class ReportsController { constructor(private domain: DomainService) {} @Get('leads') leads(@CurrentUser() u: AuthUser) { return this.domain.reportLeads(u.workspaceId); } @Get('proposals') proposals(@CurrentUser() u: AuthUser) { return this.domain.reportProposals(u.workspaceId); } }
