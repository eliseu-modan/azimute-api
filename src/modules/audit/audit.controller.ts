import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, CurrentUser, AuthUser } from '../../common/auth';
import { Roles, RolesGuard } from '../../common/roles';
import { DomainService } from '../../common/domain.service';
@Controller('audit-logs') @UseGuards(JwtAuthGuard, RolesGuard) @Roles('ADMIN','DEVELOPER')
export class AuditController { constructor(private domain: DomainService) {} @Get() list(@CurrentUser() u: AuthUser, @Query() q: any) { return this.domain.list('auditLog', u.workspaceId, q); } }
