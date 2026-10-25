import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, CurrentUser, AuthUser } from '../../common/auth';
import { PipelineService } from './pipeline.service';
import { CreatePipelineStageDto } from './dto/create-pipeline-stage.dto';
import { UpdatePipelineStageDto } from './dto/update-pipeline-stage.dto';
@Controller('pipeline/stages') @UseGuards(JwtAuthGuard)
export class PipelineController {
  constructor(private service: PipelineService) {}
  @Get() findAll(@CurrentUser() user: AuthUser) { return this.service.findAll(user.workspaceId); }
  @Get(':id') findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) { return this.service.findOne(id, user.workspaceId); }
  @Post() create(@Body() body: CreatePipelineStageDto, @CurrentUser() user: AuthUser) { return this.service.create(body, user.workspaceId); }
  @Patch(':id') update(@Param('id') id: string, @Body() body: UpdatePipelineStageDto, @CurrentUser() user: AuthUser) { return this.service.update(id, body, user.workspaceId); }
  @Delete(':id') remove(@Param('id') id: string, @CurrentUser() user: AuthUser) { return this.service.remove(id, user.workspaceId); }
}
