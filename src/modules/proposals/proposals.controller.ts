import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards, Res } from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard, CurrentUser, AuthUser } from '../../common/auth';
import { ProposalsService } from './proposals.service';
import { CreateProposalDto } from './dto/create-proposal.dto';
import { UpdateProposalDto } from './dto/update-proposal.dto';
@Controller('proposals')
@UseGuards(JwtAuthGuard)
export class ProposalsController {
  constructor(private service: ProposalsService) {}
  @Get() findAll(@CurrentUser() user: AuthUser, @Query('leadId') leadId?: string) { return this.service.findAll(user.workspaceId, leadId); }
  @Get(':id') findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) { return this.service.findOne(id, user.workspaceId); }
  @Get(':id/pdf') async pdf(@Param('id') id: string, @CurrentUser() user: AuthUser, @Res() response: Response) { const document = await this.service.renderPdf(id, user.workspaceId); response.setHeader('Content-Type', 'application/pdf'); response.setHeader('Content-Disposition', `attachment; filename="proposal-${id}.pdf"`); return response.send(document); }
  @Post() create(@Body() body: CreateProposalDto, @CurrentUser() user: AuthUser) { return this.service.create(body, user.workspaceId, user.sub); }
  @Patch(':id') update(@Param('id') id: string, @Body() body: UpdateProposalDto, @CurrentUser() user: AuthUser) { return this.service.update(id, user.workspaceId, body); }
  @Post(':id/send') send(@Param('id') id: string, @CurrentUser() user: AuthUser) { return this.service.send(id, user.workspaceId); }
  @Post(':id/approve') approve(@Param('id') id: string, @CurrentUser() user: AuthUser) { return this.service.approve(id, user.workspaceId); }
  @Post(':id/reject') reject(@Param('id') id: string, @CurrentUser() user: AuthUser) { return this.service.reject(id, user.workspaceId); }
  @Delete(':id') remove(@Param('id') id: string, @CurrentUser() user: AuthUser) { return this.service.remove(id, user.workspaceId); }
}
