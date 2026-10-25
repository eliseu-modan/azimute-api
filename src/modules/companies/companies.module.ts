import { JwtAuthGuard } from '../../common/auth';
import { Module } from '@nestjs/common';
import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';
@Module({ controllers: [CompaniesController], providers: [CompaniesService, JwtAuthGuard] })
export class CompaniesModule {}

