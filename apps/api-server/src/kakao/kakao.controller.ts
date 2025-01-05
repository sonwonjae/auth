import type { Response as ExpressResponse } from 'express';

import { Controller, Get, Query, Res } from '@nestjs/common';

import { KakaoLoginDto } from './dto/kakao-login.dto';
import { KakaoService } from './kakao.service';

@Controller('kakao')
export class KakaoController {
  constructor(private readonly kakaoService: KakaoService) {}

  @Get('login')
  async login(
    @Res({ passthrough: true }) res: ExpressResponse,
    @Query() query: KakaoLoginDto,
  ) {
    return res
      .status(302)
      .redirect(
        `https://kauth.kakao.com/oauth/authorize?client_id=${process.env.KAKAO_REST_APP_KEY as string}&redirect_uri=${process.env.KAKAO_REDIRECT_URI as string}&response_type=code&state=${encodeURIComponent(query.redirectUrl)}`,
      );
  }
}
