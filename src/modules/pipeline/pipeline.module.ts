import { JwtAuthGuard } from '../../common/auth';
import { Module } from '@nestjs/common';
import { PipelineController } from './pipeline.controller';
import { PipelineService } from './pipeline.service';
@Module({ controllers: [PipelineController], providers: [PipelineService, JwtAuthGuard] })
export class PipelineModule {}

