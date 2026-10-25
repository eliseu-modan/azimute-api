import { JwtAuthGuard } from '../../common/auth';
import { Module } from '@nestjs/common';
import { ContactsController } from './contacts.controller';
import { ContactsService } from './contacts.service';
@Module({ controllers: [ContactsController], providers: [ContactsService, JwtAuthGuard] })
export class ContactsModule {}

