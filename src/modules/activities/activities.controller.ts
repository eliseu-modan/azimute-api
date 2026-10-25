import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, CurrentUser, AuthUser } from '../../common/auth';
import { ActivitiesService } from './activities.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
@Controller('activities') @UseGuards(JwtAuthGuard)
export class ActivitiesController {
 constructor(private service: ActivitiesService) {}
 @Get() findAll(@CurrentUser() user: AuthUser, @Query('leadId') leadId?: string) { return this.service.findAll(user.workspaceId, leadId); }
 @Get(':id') findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) { return this.service.findOne(id, user.workspaceId); }
 @Post() create(@Body() body: CreateActivityDto, @CurrentUser() user: AuthUser) { return this.service.create(body, user.workspaceId, user.sub); }
 @Patch(':id') update(@Param('id') id: string, @Body() body: UpdateActivityDto, @CurrentUser() user: AuthUser) { return this.service.update(id, body, user.workspaceId); }
 @Delete(':id') remove(@Param('id') id: string, @CurrentUser() user: AuthUser) { return this.service.remove(id, user.workspaceId); }
}
