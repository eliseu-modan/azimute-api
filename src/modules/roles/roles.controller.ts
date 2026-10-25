import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/auth';
import { DomainService } from '../../common/domain.service';
@Controller('roles') @UseGuards(JwtAuthGuard)
export class RolesController { constructor(private domain: DomainService) {} @Get() list() { return this.domain.roles(); } @Get(':id/permissions') permissions(@Param('id') id: string) { return this.domain.rolePermissions(id); } }
