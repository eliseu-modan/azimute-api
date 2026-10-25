import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, CurrentUser, AuthUser } from '../../common/auth';
import { DashboardService } from './dashboard.service';
@Controller('dashboard') @UseGuards(JwtAuthGuard)
export class DashboardController {
 constructor(private service: DashboardService) {}
 @Get() summary(@CurrentUser() user: AuthUser) { return this.service.summary(user.workspaceId); }
 @Get('summary') summaryRoute(@CurrentUser() user: AuthUser) { return this.service.summary(user.workspaceId); }
 @Get('pipeline') pipeline(@CurrentUser() user: AuthUser) { return this.service.pipeline(user.workspaceId); }
 @Get('lead-sources') leadSources(@CurrentUser() user: AuthUser) { return this.service.leadSources(user.workspaceId); }
}
