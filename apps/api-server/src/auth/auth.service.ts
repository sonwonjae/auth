import type {
  CookieOptions,
  Request as ExpressRequest,
  Response as ExpressResponse,
} from 'express';

import { ForbiddenException, HttpException, Injectable } from '@nestjs/common';
import { SupabaseService } from 'src/supabase/supabase.service';
import { Tables } from 'src/supabase/supabase.types';
import { v4 as uuidv4 } from 'uuid';

import { DeleteAuthDto } from './dto/delete-auth.dto';

@Injectable()
export class AuthService {
  constructor(private readonly supabaseService: SupabaseService) {}

  /** NOTE: READ token */
  getToken(req: ExpressRequest) {
    const accessToken: string | undefined =
      req.cookies[process.env.AUTH_ACCESS_TOKEN_COOKIE_NAME as string];
    const refreshToken: string | undefined =
      req.cookies[process.env.AUTH_REFRESH_TOKEN_COOKIE_NAME as string];

    return {
      accessToken,
      refreshToken,
    };
  }

  /** NOTE: CEHCK token */
  async checkToken(req: ExpressRequest, res: ExpressResponse) {
    try {
      const { accessToken } = this.getToken(req);

      if (!accessToken) {
        return this.checkRefreshToken(req, res);
      }

      const { data: authToken } = await this.supabaseService.client
        .from('auth_tokens')
        .select('*')
        .eq('accessToken', accessToken)
        .single();

      if (!authToken) {
        return this.checkRefreshToken(req, res);
      }

      return this.getUserWithUserId(authToken.userId);
    } catch (error) {
      throw error as HttpException;
    }
  }

  /** NOTE: CEHCK refresh token */
  async checkRefreshToken(req: ExpressRequest, res: ExpressResponse) {
    const { refreshToken } = this.getToken(req);

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

    await this.reissueToken(res, authToken.userId);
    return this.getUserWithUserId(authToken.userId);
  }

  /** NOTE: CREATE token */
  async issueToken(res: ExpressResponse, userId: string) {
    const accessToken = uuidv4();
    const refreshToken = uuidv4();
    const accessTokenExpires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);
    const refreshTokenExpires = new Date(
      Date.now() + 1000 * 60 * 60 * 24 * 7 * 8,
    );

    const COMMON_COOKIE_OPTION: CookieOptions = {
      domain: process.env.DOMAIN as string,
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

  /** NOTE: DELETE token */
  async expireToken(res: ExpressResponse) {
    const EXPIRED_COOKIE_OPTION: CookieOptions = {
      domain: process.env.DOMAIN as string,
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

  /** NOTE: UPDATE token */
  async reissueToken(res: ExpressResponse, userId: string) {
    await this.expireToken(res);
    await this.issueToken(res, userId);
  }

  /** NOTE: READ user with userId */
  async getUserWithUserId(userId: string) {
    const { data: userInfo } = await this.supabaseService.client
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (!userInfo) {
      throw new ForbiddenException();
    }

    return userInfo;
  }

  /** NOTE: READ user with providerId */
  async getUserWithProviderId(providerId: string) {
    const { data: userInfo } = await this.supabaseService.client
      .from('users')
      .select('*')
      .eq('providerId', providerId)
      .single();

    return userInfo;
  }

  /** NOTE: CREATE user with providerId */
  async addUserWithProviderId(
    providerId: string,
    newUserInfo: Partial<Tables<'users'>>,
  ) {
    const userInfo = await this.getUserWithProviderId(providerId);

    if (userInfo) {
      return userInfo;
    }

    const { data: addedUserInfo } = await this.supabaseService.client
      .from('users')
      .insert(newUserInfo)
      .select('*')
      .single();

    if (!addedUserInfo) {
      throw new ForbiddenException();
    }

    return addedUserInfo;
  }

  /** NOTE: UPDATE user */
  async updateUser(updatedUserInfo: Partial<Tables<'users'>>) {
    if (!updatedUserInfo?.id) {
      throw new ForbiddenException();
    }

    const { data: userInfo } = await this.supabaseService.client
      .from('users')
      .update({ ...updatedUserInfo })
      .eq('id', updatedUserInfo.id)
      .select('*')
      .single();

    if (!userInfo) {
      throw new ForbiddenException();
    }

    return userInfo;
  }

  /** NOTE: DELETE user */
  async deleteUser(res: ExpressResponse, userId: string) {
    await this.expireToken(res);
    await this.supabaseService.client.from('users').delete().eq('id', userId);
  }

  async registQuitUserSurveyForm(
    userProviderId: string,
    quitUserSurveyForm: DeleteAuthDto,
  ) {
    await this.supabaseService.client
      .from('auth_quit_survey')
      .insert({
        userProviderId,
        reason: quitUserSurveyForm.reason,
        suggestion: quitUserSurveyForm.suggestion,
        createdAt: new Date().toISOString(),
      })
      .select('*');
  }
}
