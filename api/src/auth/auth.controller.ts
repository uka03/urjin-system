import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import type { Response, Request, CookieOptions } from 'express';
import { AccessTokenGuard } from './guards/access-token.guard';
import { CurrentUser } from 'common/decorators/current-user.decorator';
import type { AuthenticatedUser } from './types/authenticated-user.type';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  create(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.create(createAuthDto);
  }

  @Post('login')
  async login(
    @Body() dto: LoginAuthDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.login(dto);

    response.cookie(
      'refresh_token',
      result.refreshToken,
      this.getRefreshCookieOptions(),
    );

    return result.data;
  }

  private getRefreshCookieOptions() {
    return {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/api/v1/auth',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    };
  }

  @UseGuards(AccessTokenGuard)
  @Get('me')
  getMe(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.getMe(user.id);
  }

  @Post('refresh')
  async refreshToken(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = request.cookies.refresh_token;

    const result = await this.authService.refresh(refreshToken);

    response.cookie(
      'refresh_token',
      result.refreshToken,
      this.getRefreshCookieOptions(),
    );

    return result.data;
  }

  @Post('logout')
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = request.cookies.refresh_token;
    this.authService.logout(refreshToken);
    const cookieOptions: CookieOptions = {
      ...this.getRefreshCookieOptions(),
    };

    // Устгах cookie-д хадгалах хугацааг дахин тохируулахгүй.
    delete cookieOptions.maxAge;
    delete cookieOptions.expires;

    // 3. Browser дээрх refresh cookie-г устгана.
    response.clearCookie('refresh_token', cookieOptions);
  }
}
