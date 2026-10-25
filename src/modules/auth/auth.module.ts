import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../../common/auth';
@Module({ controllers: [AuthController], providers: [AuthService, JwtAuthGuard] })
export class AuthModule {}
