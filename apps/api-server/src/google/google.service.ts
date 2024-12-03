import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';

@Injectable()
export class GoogleService {
  readonly oauth2Client: InstanceType<typeof google.auth.OAuth2>;
  readonly people: ReturnType<typeof google.people>;

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_SECRET,
      process.env.GOOGLE_REDIRECT_URI,
    );
    this.people = google.people('v1');
    google.options({ auth: this.oauth2Client });
  }

  /** FIXME: 완성한거 아님 쓰면 안됨 */
  async getUserInfo(code: string) {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      console.log({ tokens });
      this.oauth2Client.credentials = tokens;
      const { data } = await this.people.people.get({
        resourceName: 'people/me',
        personFields: 'emailAddresses',
      });

      return {
        avatarUrl: '',
        name: data?.names?.[0].displayName,
        email: data?.emailAddresses?.[0].value,
      };
    } catch (err) {
      //   throw err;
      console.error({ err });
    }
  }
}
