import { Body, Controller, Delete, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { DomainService } from '../../common/domain.service';
import { JwtAuthGuard, CurrentUser, AuthUser } from '../../common/auth';
import { UpdateTaskDto } from './dto/task.dto';
@Controller('tasks') @UseGuards(JwtAuthGuard)
export class TasksController {
 constructor(private domain: DomainService) {}
 @Get() list(@CurrentUser() u: AuthUser, @Query() q: any) { return this.domain.listTasks(u.workspaceId, q); }
 @Patch(':id') update(@Param('id') id: string, @Body() b: UpdateTaskDto, @CurrentUser() u: AuthUser) { return this.domain.update('task', id, u.workspaceId, u.sub, b); }
 @Delete(':id') remove(@Param('id') id: string, @CurrentUser() u: AuthUser) { return this.domain.remove('task', id, u.workspaceId, u.sub); }
}
