import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { DomainService } from '../../common/domain.service';
import { JwtAuthGuard, CurrentUser, AuthUser } from '../../common/auth';
import { CreateRequirementDto, UpdateRequirementDto } from './dto/requirement.dto';
@Controller('requirements') @UseGuards(JwtAuthGuard)
export class RequirementsController {
 constructor(private domain: DomainService) {}
 @Get() list(@CurrentUser() u: AuthUser, @Query() q: any) { return this.domain.list('requirement', u.workspaceId, q); }
 @Post() create(@Body() b: CreateRequirementDto, @CurrentUser() u: AuthUser) { return this.domain.create('requirement', u.workspaceId, u.sub, b); }
 @Get(':id') get(@Param('id') id: string, @CurrentUser() u: AuthUser) { return this.domain.findOne('requirement', id, u.workspaceId); }
 @Patch(':id') update(@Param('id') id: string, @Body() b: UpdateRequirementDto, @CurrentUser() u: AuthUser) { return this.domain.update('requirement', id, u.workspaceId, u.sub, b); }
 @Delete(':id') remove(@Param('id') id: string, @CurrentUser() u: AuthUser) { return this.domain.remove('requirement', id, u.workspaceId, u.sub); }
}
