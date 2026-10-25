import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, CurrentUser, AuthUser } from '../../common/auth';
import { Roles, RolesGuard } from '../../common/roles';
import { DomainService } from '../../common/domain.service';
import { UpdateCompanySettingsDto } from './dto/update-company-settings.dto';
import { LeadSourceDto } from './dto/lead-source.dto';
@Controller('settings') @UseGuards(JwtAuthGuard, RolesGuard)
export class SettingsController {
 constructor(private domain: DomainService) {}
 @Get() get(@CurrentUser() u: AuthUser) { return this.domain.settings(u.workspaceId); }
 @Patch('company') @Roles('ADMIN') updateCompany(@Body() b: UpdateCompanySettingsDto, @CurrentUser() u: AuthUser) { return this.domain.updateSettings(u.workspaceId, b.company); }
 @Get('lead-sources') sources(@CurrentUser() u: AuthUser) { return this.domain.list('leadSource', u.workspaceId); }
 @Post('lead-sources') @Roles('ADMIN') createSource(@Body() b: LeadSourceDto, @CurrentUser() u: AuthUser) { return this.domain.create('leadSource', u.workspaceId, u.sub, b); }
 @Patch('lead-sources/:id') @Roles('ADMIN') updateSource(@Param('id') id: string, @Body() b: LeadSourceDto, @CurrentUser() u: AuthUser) { return this.domain.update('leadSource', id, u.workspaceId, u.sub, b); }
}
