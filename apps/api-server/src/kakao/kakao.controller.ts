import type {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from 'express';

import { Controller, Get, Query, Req, Res } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';

import { KakaoService } from './kakao.service';

@Controller('kakao')
export class KakaoController {
  constructor(
    private readonly kakaoService: KakaoService,
    private readonly authService: AuthService,
  ) {}

  @Get('login')
  async login(
    @Req() req: ExpressRequest,
    @Res({ passthrough: true }) res: ExpressResponse,
  ) {
    try {
      const { accessToken } = this.authService.getTokenInfo(req);
      await this.authService.getUserInfoWithAccessToken(accessToken);

      if (typeof req.query.redirectUrl === 'string') {
        return res.status(302).redirect(req.query.redirectUrl);
      }

      return res
        .status(302)
        .redirect(`${process.env.WEB_SERVER_HOST as string}/auth/info`);
    } catch {
      const redirectUrl =
        typeof req.query.redirectUrl === 'string'
          ? `&state=${encodeURIComponent(req.query.redirectUrl)}`
          : '';

      return res
        .status(302)
        .redirect(
          `https://kauth.kakao.com/oauth/authorize?client_id=${process.env.KAKAO_REST_APP_KEY as string}&redirect_uri=${process.env.KAKAO_REDIRECT_URI as string}&response_type=code${redirectUrl}`,
        );
    }
  }

  @Get('callback')
  async callback(
    @Res({ passthrough: true }) res: ExpressResponse,
    @Query('code') code: string,
    @Query('state') state?: string,
  ) {
    const userInfo = await this.kakaoService.getUserInfo(code);
    await this.authService.registUser(res, userInfo);

    if (typeof state === 'string') {
      return res.status(302).redirect(state);
    }

    return res
      .status(302)
      .redirect(`${process.env.WEB_SERVER_HOST as string}/auth/info`);
  }
}
