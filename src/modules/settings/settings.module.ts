import { Module } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/auth';
import { RolesGuard } from '../../common/roles';
import { DomainService } from '../../common/domain.service';
import { SettingsController } from './settings.controller';
@Module({ controllers: [SettingsController], providers: [JwtAuthGuard, RolesGuard, DomainService] }) export class SettingsModule {}
