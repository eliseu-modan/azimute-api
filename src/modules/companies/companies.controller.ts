import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, CurrentUser, AuthUser } from '../../common/auth';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
@Controller('companies') @UseGuards(JwtAuthGuard)
export class CompaniesController {
  constructor(private service: CompaniesService) {}
  @Get() findAll(@CurrentUser() user: AuthUser, @Query() query: any) { return this.service.findAll(user.workspaceId, query); }
  @Get(':id') findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) { return this.service.findOne(id, user.workspaceId); }
  @Post() create(@Body() body: CreateCompanyDto, @CurrentUser() user: AuthUser) { return this.service.create(body, user.workspaceId); }
  @Patch(':id') update(@Param('id') id: string, @Body() body: UpdateCompanyDto, @CurrentUser() user: AuthUser) { return this.service.update(id, user.workspaceId, body); }
  @Delete(':id') remove(@Param('id') id: string, @CurrentUser() user: AuthUser) { return this.service.remove(id, user.workspaceId); }
}
