import type { Response as ExpressResponse } from 'express';

import { Controller, Get, Res, Query } from '@nestjs/common';

import { GoogleService } from './google.service';

@Controller('google')
export class GoogleController {
  constructor(private readonly googleService: GoogleService) {}

  @Get('login')
  async login(@Res({ passthrough: true }) res: ExpressResponse) {
    const authorizeUrl = this.googleService.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/contacts.readonly',
        'https://www.googleapis.com/auth/user.emails.read',
        'profile',
      ].join(' '),
    });

    return res.status(302).redirect(authorizeUrl);
  }

  /** FIXME: 완성 못함, 쓰면 안됨 */
  @Get('callback')
  async callback(@Query('code') code: string) {
    console.log({ code });
    const userInfo = await this.googleService.getUserInfo(code);
    console.dir(userInfo, { depth: null });
  }
}
