import { Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, CurrentUser, AuthUser } from '../../common/auth';
import { DomainService } from '../../common/domain.service';
@Controller('notifications') @UseGuards(JwtAuthGuard)
export class NotificationsController { constructor(private domain: DomainService) {} @Get() list(@CurrentUser() u: AuthUser, @Query() q: any) { return this.domain.listNotifications(u, q); } @Patch(':id/read') read(@Param('id') id: string, @CurrentUser() u: AuthUser) { return this.domain.readNotification(id, u); } }
