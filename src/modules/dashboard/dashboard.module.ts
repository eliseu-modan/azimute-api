import { JwtAuthGuard } from '../../common/auth';
import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
@Module({ controllers: [DashboardController], providers: [DashboardService, JwtAuthGuard] })
export class DashboardModule {}

