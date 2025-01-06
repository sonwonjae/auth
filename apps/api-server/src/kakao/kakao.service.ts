import type {
  OAuthTokenBody,
  OAuthTokenResponse,
  KakaoUserInfo,
} from './kakao.type';
import type { AxiosError } from 'axios';

import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { catchError, firstValueFrom } from 'rxjs';

@Injectable()
export class KakaoService {
  constructor(private readonly httpService: HttpService) {}
  async getKakaoUserInfoWithProviderId(providerId: string) {
    try {
      const { data: userInfo } = await firstValueFrom(
        this.httpService.post<KakaoUserInfo>(
          'https://kapi.kakao.com/v2/user/me',
          {
            target_id_type: 'user_id',

            // target_id: '3865394988', // 테스터 계정 - 회원 탈퇴
            // target_id: '3811905639', // 손원재 계정 - 연결 해제
            // target_id: '3840532092', // 김유라 계정 - 정상 유저
            target_id: providerId,
          },
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              Authorization: `KakaoAK ${process.env.KAKAO_ADMIN_APP_KEY}`,
            },
          },
        ),
      );
      return userInfo;
    } catch (error) {
      throw error as AxiosError;
    }
  }

  async getUserInfoWithCode(code: string, redirectUrl: string) {
    try {
      const {
        data: { access_token: accessToken },
      } = await firstValueFrom(
        this.httpService
          .post<OAuthTokenResponse, OAuthTokenBody>(
            'https://kauth.kakao.com/oauth/token',
            {
              grant_type: 'authorization_code',
              client_id: process.env.KAKAO_REST_APP_KEY,
              redirect_uri: redirectUrl,
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
    } catch (err) {
      const error = err as AxiosError;
      console.error(error?.response?.data);
      throw error as AxiosError;
    }
  }

  async logout(providerId: string) {
    try {
      return await firstValueFrom(
        this.httpService.post(
          'https://kapi.kakao.com/v1/user/logout',
          {
            target_id_type: 'user_id',
            target_id: providerId,
          },
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              Authorization: `KakaoAK ${process.env.KAKAO_ADMIN_APP_KEY}`,
            },
          },
        ),
      );
    } catch (error) {
      throw error as AxiosError;
    }
  }

  async quit(providerId: string) {
    try {
      return await firstValueFrom(
        this.httpService.post(
          'https://kapi.kakao.com/v1/user/unlink',
          {
            target_id_type: 'user_id',
            target_id: providerId,
          },
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              Authorization: `KakaoAK ${process.env.KAKAO_ADMIN_APP_KEY}`,
            },
          },
        ),
      );
    } catch (error) {
      throw error as AxiosError;
    }
  }
}
