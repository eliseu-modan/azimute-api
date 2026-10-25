import { Module } from '@nestjs/common';
import { DomainService } from '../../common/domain.service';
import { JwtAuthGuard } from '../../common/auth';
import { RequirementsController } from './requirements.controller';
@Module({ controllers: [RequirementsController], providers: [DomainService, JwtAuthGuard] }) export class RequirementsModule {}
