import { Body, Controller, Get, Param, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';
import { DomainService } from '../../common/domain.service';
import { JwtAuthGuard, CurrentUser, AuthUser } from '../../common/auth';
import { Roles, RolesGuard } from '../../common/roles';
import { CreateSurveyDto, UpdateSurveyDto, DiagnosisDto } from './dto/survey.dto';
@Controller('surveys') @UseGuards(JwtAuthGuard, RolesGuard)
export class SurveysController {
 constructor(private domain: DomainService) {}
 @Get() list(@CurrentUser() u: AuthUser, @Query() q: any) { return this.domain.list('requirementSurvey', u.workspaceId, q); }
 @Post() create(@Body() b: CreateSurveyDto, @CurrentUser() u: AuthUser) { return this.domain.create('requirementSurvey', u.workspaceId, u.sub, b); }
 @Get(':id') get(@Param('id') id: string, @CurrentUser() u: AuthUser) { return this.domain.findOne('requirementSurvey', id, u.workspaceId); }
 @Patch(':id') update(@Param('id') id: string, @Body() b: UpdateSurveyDto, @CurrentUser() u: AuthUser) { return this.domain.update('requirementSurvey', id, u.workspaceId, u.sub, b); }
 @Post(':id/complete') complete(@Param('id') id: string, @CurrentUser() u: AuthUser) { return this.domain.update('requirementSurvey', id, u.workspaceId, u.sub, { status: 'COMPLETED', completedAt: new Date() }); }
 @Get(':id/diagnosis') @Roles('ADMIN','DEVELOPER') diagnosis(@Param('id') id: string, @CurrentUser() u: AuthUser) { return this.domain.getDiagnosis(id, u.workspaceId); }
 @Put(':id/diagnosis') @Roles('ADMIN','DEVELOPER') saveDiagnosis(@Param('id') id: string, @Body() b: DiagnosisDto, @CurrentUser() u: AuthUser) { return this.domain.saveDiagnosis(id, u.workspaceId, b); }
 @Post(':id/suggest-requirements') suggest(@Param('id') id: string, @CurrentUser() u: AuthUser) { return this.domain.suggestRequirements(id, u.workspaceId, u.sub); }
 @Post(':id/approve-suggested-requirements') approve(@Param('id') id: string, @CurrentUser() u: AuthUser) { return this.domain.approveSuggestions(id, u.workspaceId); }
}
