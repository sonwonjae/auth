import type {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from 'express';

import { Controller, Get, Req, Res } from '@nestjs/common';

import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('check')
  async check(
    @Req() req: ExpressRequest,
    @Res({ passthrough: true }) res: ExpressResponse,
  ) {
    const { accessToken, refreshToken } = this.authService.getTokenInfo(req);
    try {
      return await this.authService.getUserInfoWithAccessToken(accessToken);
    } catch {
      return await this.authService.reissueToken(res, refreshToken);
    }
  }

  @Get('logout')
  logout(@Res({ passthrough: true }) res: ExpressResponse) {
    this.authService.expireTokenInfo(res);
    return res.status(302).redirect(process.env.WEB_SERVER_HOST as string);
  }
}
