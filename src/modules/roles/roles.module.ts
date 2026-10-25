import { Module } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/auth';
import { DomainService } from '../../common/domain.service';
import { RolesController } from './roles.controller';
@Module({ controllers: [RolesController], providers: [JwtAuthGuard, DomainService] }) export class RolesModule {}
