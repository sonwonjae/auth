import type {
  OAuthTokenBody,
  OAuthTokenResponse,
  KakaoUserInfo,
} from './kako.type';
import type { AxiosError } from 'axios';

import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { catchError, firstValueFrom } from 'rxjs';

@Injectable()
export class KakaoService {
  constructor(private readonly httpService: HttpService) {}

  async getUserInfo(code: string) {
    const {
      data: { access_token: accessToken },
    } = await firstValueFrom(
      this.httpService
        .post<OAuthTokenResponse, OAuthTokenBody>(
          'https://kauth.kakao.com/oauth/token',
          {
            grant_type: 'authorization_code',
            client_id: process.env.KAKAO_REST_APP_KEY,
            redirect_uri: process.env.KAKAO_REDIRECT_URI,
            code,
          },
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          },
        )
        .pipe(
          catchError((error) => {
            throw error;
          }),
        ),
    );

    const { data: userInfo } = await firstValueFrom(
      this.httpService
        .post<KakaoUserInfo>(
          'https://kapi.kakao.com/v2/user/me',
          {},
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              Authorization: `Bearer ${accessToken}`,
            },
          },
        )
        .pipe(
          catchError((error: AxiosError) => {
            throw error;
          }),
        ),
    );

    return {
      avatarUrl: userInfo?.kakao_account?.profile?.profile_image_url ?? '',
      name: userInfo?.kakao_account?.name ?? '손원재',
      email: userInfo?.kakao_account?.email ?? 'sonwj091552@gmail.com',
      providerId: String(userInfo.id),
      provider: 'kakao',
    } as const;
  }
}
