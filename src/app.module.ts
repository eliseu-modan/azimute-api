import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { ContactsModule } from './modules/contacts/contacts.module';
import { PipelineModule } from './modules/pipeline/pipeline.module';
import { LeadsModule } from './modules/leads/leads.module';
import { ActivitiesModule } from './modules/activities/activities.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { ProposalsModule } from './modules/proposals/proposals.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import { FilesModule } from './modules/files/files.module';
import { SurveysModule } from './modules/surveys/surveys.module';
import { RequirementsModule } from './modules/requirements/requirements.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { FollowUpsModule } from './modules/follow-ups/follow-ups.module';
import { RolesModule } from './modules/roles/roles.module';
import { SettingsModule } from './modules/settings/settings.module';
import { ReportsModule } from './modules/reports/reports.module';
import { AuditModule } from './modules/audit/audit.module';
import { NotificationsModule } from './modules/notifications/notifications.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
    PrismaModule,
    AuthModule,
    UsersModule,
    CompaniesModule,
    ContactsModule,
    PipelineModule,
    LeadsModule,
    ActivitiesModule,
    ProposalsModule,
    DashboardModule,
    FilesModule,
    SurveysModule,
    RequirementsModule,
    ProjectsModule,
    TasksModule,
    FollowUpsModule,
    RolesModule,
    SettingsModule,
    ReportsModule,
    AuditModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
