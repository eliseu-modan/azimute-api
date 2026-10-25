import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { DomainService } from '../../common/domain.service';
import { JwtAuthGuard, CurrentUser, AuthUser } from '../../common/auth';
import { CreateFollowUpDto, UpdateFollowUpDto } from './dto/follow-up.dto';
@Controller('follow-ups') @UseGuards(JwtAuthGuard)
export class FollowUpsController {
 constructor(private domain: DomainService) {}
 @Get() list(@CurrentUser() u: AuthUser, @Query() q: any) { return this.domain.list('followUp', u.workspaceId, q); }
 @Post() create(@Body() b: CreateFollowUpDto, @CurrentUser() u: AuthUser) { return this.domain.create('followUp', u.workspaceId, u.sub, b); }
 @Get(':id') get(@Param('id') id: string, @CurrentUser() u: AuthUser) { return this.domain.findOne('followUp', id, u.workspaceId); }
 @Patch(':id') update(@Param('id') id: string, @Body() b: UpdateFollowUpDto, @CurrentUser() u: AuthUser) { return this.domain.update('followUp', id, u.workspaceId, u.sub, b); }
 @Delete(':id') remove(@Param('id') id: string, @CurrentUser() u: AuthUser) { return this.domain.remove('followUp', id, u.workspaceId, u.sub); }
}
