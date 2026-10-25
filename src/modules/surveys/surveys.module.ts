import { Module } from '@nestjs/common';
import { DomainService } from '../../common/domain.service';
import { JwtAuthGuard } from '../../common/auth';
import { RolesGuard } from '../../common/roles';
import { SurveysController } from './surveys.controller';
@Module({ controllers: [SurveysController], providers: [DomainService, JwtAuthGuard, RolesGuard] }) export class SurveysModule {}
