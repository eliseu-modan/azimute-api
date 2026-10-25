import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, CurrentUser, AuthUser } from '../../common/auth';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
@Controller() @UseGuards(JwtAuthGuard)
export class ContactsController {
  constructor(private service: ContactsService) {}
  @Get('contacts') findAll(@CurrentUser() user: AuthUser, @Query('companyId') companyId?: string) { return this.service.findAll(user.workspaceId, companyId); }
  @Get('companies/:companyId/contacts') companyContacts(@Param('companyId') companyId: string, @CurrentUser() user: AuthUser) { return this.service.findAll(user.workspaceId, companyId); }
  @Post('companies/:companyId/contacts') createForCompany(@Param('companyId') companyId: string, @Body() body: Omit<CreateContactDto,'companyId'>, @CurrentUser() user: AuthUser) { return this.service.create({ ...body, companyId }, user.workspaceId); }
  @Post('contacts') create(@Body() body: CreateContactDto, @CurrentUser() user: AuthUser) { return this.service.create(body, user.workspaceId); }
  @Get('contacts/:id') findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) { return this.service.findOne(id, user.workspaceId); }
  @Patch('contacts/:id') update(@Param('id') id: string, @Body() body: UpdateContactDto, @CurrentUser() user: AuthUser) { return this.service.update(id, body, user.workspaceId); }
  @Delete('contacts/:id') remove(@Param('id') id: string, @CurrentUser() user: AuthUser) { return this.service.remove(id, user.workspaceId); }
}
