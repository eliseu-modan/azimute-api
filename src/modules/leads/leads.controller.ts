import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, CurrentUser, AuthUser } from '../../common/auth';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { UpdateLeadStatusDto } from './dto/update-lead-status.dto';
import { LeadQueryDto } from './dto/lead-query.dto';
@Controller('leads') @UseGuards(JwtAuthGuard)
export class LeadsController {
  constructor(private service: LeadsService) {}
  @Get() findAll(@CurrentUser() user: AuthUser, @Query() query: LeadQueryDto) { return this.service.findAll(query, user.workspaceId); }
  @Post() create(@Body() body: CreateLeadDto, @CurrentUser() user: AuthUser) { return this.service.create(body, user.workspaceId, user.sub); }
  @Get(':id') findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) { return this.service.findOne(id, user.workspaceId); }
  @Patch(':id') update(@Param('id') id: string, @Body() body: UpdateLeadDto, @CurrentUser() user: AuthUser) { return this.service.update(id, body, user.workspaceId, user.sub); }
  @Patch(':id/status') status(@Param('id') id: string, @Body() body: UpdateLeadStatusDto, @CurrentUser() user: AuthUser) { return this.service.updateStatus(id, body.status, user.workspaceId, user.sub); }
  @Post(':id/convert') convert(@Param('id') id: string, @CurrentUser() user: AuthUser) { return this.service.convert(id, user.workspaceId, user.sub); }
  @Get(':id/history') history(@Param('id') id: string, @CurrentUser() user: AuthUser) { return this.service.history(id, user.workspaceId); }
  @Delete(':id') remove(@Param('id') id: string, @CurrentUser() user: AuthUser) { return this.service.remove(id, user.workspaceId, user.sub); }
}
