import type {
  CookieOptions,
  Request as ExpressRequest,
  Response as ExpressResponse,
} from 'express';

import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { SupabaseService } from 'src/supabase/supabase.service';
import { Tables } from 'src/supabase/supabase.types';
import { v4 as uuidv4 } from 'uuid';

import { UserInfo } from './auth.type';

@Injectable()
export class AuthService {
  constructor(private readonly supabaseService: SupabaseService) {}

  getTokenInfo(req: ExpressRequest) {
    const accessToken: string | undefined =
      req.cookies[process.env.AUTH_ACCESS_TOKEN_COOKIE_NAME as string];
    const refreshToken: string | undefined =
      req.cookies[process.env.AUTH_REFRESH_TOKEN_COOKIE_NAME as string];

    return {
      accessToken,
      refreshToken,
    };
  }

  async getUserInfoWithAccessToken(accessToken?: string) {
    if (!accessToken) {
      throw new UnauthorizedException();
    }

    const { data: authToken } = await this.supabaseService.client
      .from('auth_tokens')
      .select('*')
      .eq('accessToken', accessToken)
      .single();

    if (!authToken) {
      throw new UnauthorizedException();
    }

    const { data: userInfo } = await this.supabaseService.client
      .from('users')
      .select('*')
      .eq('id', authToken.userId)
      .single();

    if (!userInfo) {
      throw new UnauthorizedException();
    }

    return userInfo;
  }

  expireTokenInfo(res: ExpressResponse) {
    const EXPIRED_COOKIE_OPTION: CookieOptions = {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
      path: '/',
      expires: new Date(0),
    };

    res.cookie(
      process.env.AUTH_ACCESS_TOKEN_COOKIE_NAME as string,
      '',
      EXPIRED_COOKIE_OPTION,
    );
    res.cookie(
      process.env.AUTH_REFRESH_TOKEN_COOKIE_NAME as string,
      '',
      EXPIRED_COOKIE_OPTION,
    );
  }

  async issueToken(res: ExpressResponse, userId: string) {
    const accessToken = uuidv4();
    const refreshToken = uuidv4();
    const accessTokenExpires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);
    const refreshTokenExpires = new Date(
      Date.now() + 1000 * 60 * 60 * 24 * 7 * 8,
    );

    const COMMON_COOKIE_OPTION: CookieOptions = {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
      path: '/',
    };
    const ACCESS_TOKEN_COOKIE_OPTION: CookieOptions = {
      ...COMMON_COOKIE_OPTION,
      expires: accessTokenExpires,
    };
    const REFRESH_TOKEN_COOKIE_OPTION: CookieOptions = {
      ...COMMON_COOKIE_OPTION,
      expires: refreshTokenExpires,
    };
    res.cookie(
      process.env.AUTH_ACCESS_TOKEN_COOKIE_NAME as string,
      accessToken,
      ACCESS_TOKEN_COOKIE_OPTION,
    );
    res.cookie(
      process.env.AUTH_REFRESH_TOKEN_COOKIE_NAME as string,
      refreshToken,
      REFRESH_TOKEN_COOKIE_OPTION,
    );

    await this.supabaseService.client.from('auth_tokens').upsert(
      {
        userId,
        accessToken,
        accessTokenExpires: accessTokenExpires.toUTCString(),
        refreshToken,
        refreshTokenExpires: refreshTokenExpires.toUTCString(),
      },
      { onConflict: 'userId' },
    );
  }

  async reissueToken(res: ExpressResponse, refreshToken?: string) {
    if (!refreshToken) {
      throw new ForbiddenException();
    }
    const { data: authToken } = await this.supabaseService.client
      .from('auth_tokens')
      .select('*')
      .eq('refreshToken', refreshToken)
      .single();

    if (!authToken) {
      throw new ForbiddenException();
    }

    const { data: userInfo } = await this.supabaseService.client
      .from('users')
      .select('*')
      .eq('id', authToken.userId)
      .single();

    if (!userInfo) {
      throw new ForbiddenException();
    }

    await this.issueToken(res, userInfo.id);

    return userInfo;
  }

  async addUser(res: ExpressResponse, newUserInfo: Partial<Tables<'users'>>) {
    const { data: userInfo } = await this.supabaseService.client
      .from('users')
      .insert(newUserInfo)
      .select('*')
      .single();

    if (!userInfo) {
      throw new ForbiddenException();
    }
    await this.issueToken(res, userInfo.id);

    return userInfo;
  }

  async updateUser(
    res: ExpressResponse,
    updatedUserInfo: Partial<Tables<'users'>> & { id: Tables<'users'>['id'] },
  ) {
    const { data: userInfo } = await this.supabaseService.client
      .from('users')
      .update({ ...updatedUserInfo })
      .eq('id', updatedUserInfo.id)
      .select('*')
      .single();

    if (!userInfo) {
      throw new ForbiddenException();
    }
    await this.issueToken(res, userInfo.id);

    return userInfo;
  }

  async registUser(res: ExpressResponse, newUserInfo: UserInfo) {
    const { data: userInfo } = await this.supabaseService.client
      .from('users')
      .select('*')
      .eq('providerId', newUserInfo.providerId)
      .single();

    const isUser = !!userInfo?.id;

    if (isUser) {
      await this.updateUser(res, {
        ...newUserInfo,
        id: userInfo.id,
      });
    } else {
      await this.addUser(res, newUserInfo);
    }
  }
}
