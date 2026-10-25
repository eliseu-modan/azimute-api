import { JwtAuthGuard } from '../../common/auth';
import { Module } from '@nestjs/common';
import { ActivitiesController } from './activities.controller';
import { ActivitiesService } from './activities.service';
@Module({ controllers: [ActivitiesController], providers: [ActivitiesService, JwtAuthGuard] })
export class ActivitiesModule {}

