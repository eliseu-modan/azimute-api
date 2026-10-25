import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import {
  JwtAuthGuard,
  CurrentUser,
  AuthUser,
  SESSION_COOKIE,
} from '../../common/auth';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Throttle } from '@nestjs/throttler';

const cookieValue = (request: Request) => {
  const entry = (request.headers.cookie ?? '')
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${SESSION_COOKIE}=`));
  return entry
    ? decodeURIComponent(entry.slice(SESSION_COOKIE.length + 1))
    : undefined;
};
const setSessionCookie = (response: Response, value: string) => {
  const sameSite = ['Strict', 'None'].includes(
    process.env.COOKIE_SAME_SITE ?? '',
  )
    ? process.env.COOKIE_SAME_SITE
    : 'Lax';
  const secure =
    process.env.NODE_ENV === 'production' || sameSite === 'None'
      ? '; Secure'
      : '';
  response.setHeader(
    'Set-Cookie',
    `${SESSION_COOKIE}=${encodeURIComponent(value)}; HttpOnly; SameSite=${sameSite}; Path=/; Max-Age=43200${secure}`,
  );
};

@Controller('auth')
export class AuthController {
  constructor(private service: AuthService) {}

  @Post('login')
  @HttpCode(200)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.service.login(
      body.email,
      body.password,
      body.workspaceSlug,
    );
    setSessionCookie(response, result.token);
    return {
      user: result.user,
      role: result.role,
      workspace: result.workspace,
    };
  }

  @Post('logout')
  @HttpCode(200)
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.service.logout(cookieValue(request));
    const sameSite = ['Strict', 'None'].includes(
      process.env.COOKIE_SAME_SITE ?? '',
    )
      ? process.env.COOKIE_SAME_SITE
      : 'Lax';
    response.setHeader(
      'Set-Cookie',
      `${SESSION_COOKIE}=; HttpOnly; SameSite=${sameSite}; Path=/; Max-Age=0${process.env.NODE_ENV === 'production' || sameSite === 'None' ? '; Secure' : ''}`,
    );
    return { success: true };
  }

  @Get('session')
  @UseGuards(JwtAuthGuard)
  session(@CurrentUser() user: AuthUser) {
    return this.service.getSession(user.sub, user.workspaceId);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async changePassword(
    @CurrentUser() user: AuthUser,
    @Body() body: ChangePasswordDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.service.changePassword(
      user.sub,
      body.currentPassword,
      body.newPassword,
    );
    const sameSite = ['Strict', 'None'].includes(
      process.env.COOKIE_SAME_SITE ?? '',
    )
      ? process.env.COOKIE_SAME_SITE
      : 'Lax';
    response.setHeader(
      'Set-Cookie',
      `${SESSION_COOKIE}=; HttpOnly; SameSite=${sameSite}; Path=/; Max-Age=0${process.env.NODE_ENV === 'production' || sameSite === 'None' ? '; Secure' : ''}`,
    );
    return result;
  }

  @Post('forgot-password')
  @HttpCode(202)
  forgotPassword() {
    return {
      message:
        'Se o e-mail estiver cadastrado, enviaremos as instruções de recuperação.',
    };
  }

  @Post('reset-password')
  @HttpCode(501)
  resetPassword() {
    return {
      error: {
        code: 'RESET_DELIVERY_NOT_CONFIGURED',
        message:
          'Configure um provedor de e-mail para habilitar a redefinição de senha.',
      },
    };
  }
}
