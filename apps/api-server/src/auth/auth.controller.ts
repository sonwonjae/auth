import type {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from 'express';

import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { AxiosError } from 'axios';
import { KakaoService } from 'src/kakao/kakao.service';
import { Tables } from 'src/supabase/supabase.types';

import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly kakaoService: KakaoService,
  ) {}

  @Get('callback/login/:provider')
  async loginCallback(
    @Res({ passthrough: true }) res: ExpressResponse,
    @Param('provider') provider: 'kakao',
    @Query('code') code: string,
    @Query('state') state: string,
  ) {
    const oauthUserInfo = await (async () => {
      switch (provider) {
        case 'kakao':
          return await this.kakaoService.getUserInfoWithCode(code);
      }
    })();
    const userInfo = await this.authService.addUserWithProviderId(
      oauthUserInfo.providerId,
      oauthUserInfo,
    );
    await this.authService.reissueToken(res, userInfo.id);

    const redirectUrl = state;
    return res.status(302).redirect(redirectUrl);
  }

  /** NOTE: 유효성 검증 */
  @Get('check')
  async check(
    @Req() req: ExpressRequest,
    @Res({ passthrough: true }) res: ExpressResponse,
  ) {
    const userInfo = await this.authService.checkToken(req, res);
    const { provider, providerId } = userInfo;

    try {
      switch (provider) {
        case 'kakao':
          await this.kakaoService.getKakaoUserInfoWithProviderId(providerId);
      }

      return userInfo;
    } catch (err) {
      const error = err as AxiosError;
      const errorData =
        (error?.response?.data as { msg: string; code: number }) ?? {};

      /** NOTE: 회원 탈퇴했거나 앱 연결을 끊은 경우 */
      if (errorData.code === -101) {
        await this.authService.deleteUser(res, userInfo.id);
      }

      throw error;
    }
  }

  /** NOTE: 로그아웃 */
  @Get('logout')
  async logout(
    @Req() req: ExpressRequest,
    @Res({ passthrough: true }) res: ExpressResponse,
  ) {
    const { provider, providerId } = await this.authService.checkToken(
      req,
      res,
    );
    await this.authService.expireToken(res);

    switch (provider) {
      case 'kakao':
        await this.kakaoService.logout(providerId);
        return;
    }
  }

  /** NOTE: 회원탈퇴 */
  @Get('quit')
  async quit(
    @Req() req: ExpressRequest,
    @Res({ passthrough: true }) res: ExpressResponse,
  ) {
    const {
      provider,
      providerId,
      id: userId,
    } = await this.authService.checkToken(req, res);
    await this.authService.expireToken(res);
    await this.authService.deleteUser(res, userId);

    switch (provider) {
      case 'kakao':
        await this.kakaoService.quit(providerId);
        return;
    }
  }

  /** NOTE: 유저 정보 업데이트 */
  @Patch('')
  async updateUser(@Body() updatedUserInfo: Partial<Tables<'users'>>) {
    return this.authService.updateUser(updatedUserInfo);
  }
}
