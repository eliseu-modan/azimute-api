import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard, CurrentUser, AuthUser } from '../../common/auth';
import { Roles, RolesGuard } from '../../common/roles';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class UsersController {
  constructor(private service: UsersService) {}
  @Get() findAll(@CurrentUser() user: AuthUser) {
    return this.service.findAll(user.workspaceId);
  }
  @Get(':id') findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.service.findOne(id, user.workspaceId);
  }
  @Post() create(@Body() body: CreateUserDto, @CurrentUser() user: AuthUser) {
    return this.service.create(body, user.workspaceId);
  }
  @Patch(':id') update(@Param('id') id: string, @Body() body: UpdateUserDto, @CurrentUser() user: AuthUser) {
    return this.service.update(id, body, user.workspaceId);
  }
  @Patch(':id/role') updateRole(@Param('id') id: string, @Body() body: UpdateUserRoleDto, @CurrentUser() user: AuthUser) {
    return this.service.updateRole(id, user.workspaceId, body.role);
  }
  @Delete(':id') remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.service.remove(id, user.workspaceId);
  }
}

