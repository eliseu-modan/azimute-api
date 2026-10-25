import { Module } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/auth';
import { FilesController } from './files.controller';
@Module({ controllers: [FilesController], providers: [JwtAuthGuard] }) export class FilesModule {}
