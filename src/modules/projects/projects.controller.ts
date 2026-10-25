import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { DomainService } from '../../common/domain.service';
import { JwtAuthGuard, CurrentUser, AuthUser } from '../../common/auth';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';
@Controller('projects') @UseGuards(JwtAuthGuard)
export class ProjectsController {
 constructor(private domain: DomainService) {}
 @Get() list(@CurrentUser() u: AuthUser, @Query() q: any) { return this.domain.list('project', u.workspaceId, q); }
 @Post() create(@Body() b: CreateProjectDto, @CurrentUser() u: AuthUser) { return this.domain.create('project', u.workspaceId, u.sub, b); }
 @Get(':id') get(@Param('id') id: string, @CurrentUser() u: AuthUser) { return this.domain.findOne('project', id, u.workspaceId); }
 @Patch(':id') update(@Param('id') id: string, @Body() b: UpdateProjectDto, @CurrentUser() u: AuthUser) { return this.domain.update('project', id, u.workspaceId, u.sub, b); }
 @Get(':id/tasks') tasks(@Param('id') id: string, @CurrentUser() u: AuthUser, @Query() q: any) { return this.domain.listTasks(u.workspaceId, { ...q, projectId: id }); }
 @Post(':id/tasks') createTask(@Param('id') id: string, @Body() b: any, @CurrentUser() u: AuthUser) { return this.domain.create('task', u.workspaceId, u.sub, { ...b, projectId: id }); }
}
