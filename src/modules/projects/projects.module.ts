import { Module } from '@nestjs/common';
import { DomainService } from '../../common/domain.service';
import { JwtAuthGuard } from '../../common/auth';
import { ProjectsController } from './projects.controller';
@Module({ controllers: [ProjectsController], providers: [DomainService, JwtAuthGuard] }) export class ProjectsModule {}
