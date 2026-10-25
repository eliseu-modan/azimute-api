import { JwtAuthGuard } from '../../common/auth';
import { Module } from '@nestjs/common';
import { LeadsController } from './leads.controller';
import { LeadsService } from './leads.service';
@Module({ controllers: [LeadsController], providers: [LeadsService, JwtAuthGuard] })
export class LeadsModule {}

