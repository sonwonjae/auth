export interface OAuthTokenBody {
  grant_type: 'authorization_code';
  client_id: typeof process.env.KAKAO_REST_APP_KEY;
  redirect_uri: typeof process.env.KAKAO_LOGIN_REDIRECT_URI;
  code: string;
  client_secret?: string;
}

export interface OAuthTokenResponse {
  token_type: 'bearer';
  id_token?: string;
  access_token: string;
  expires_in: number;
  refresh_token: string;
  refresh_token_expires_in: number;
  scope?: string;
}

interface KakaoAccountProfile {
  nickname?: string;
  thumbnail_image_url?: string;
  profile_image_url?: string;
  is_default_image?: boolean;
  is_default_nickname?: boolean;
}

interface KakaoAccount {
  profile_needs_agreement: boolean;
  profile_nickname_needs_agreement: boolean;
  profile_image_needs_agreement: boolean;
  profile: KakaoAccountProfile;
  name_needs_agreement?: boolean;
  name?: string;
  email_needs_agreement?: boolean;
  is_email_valid?: boolean;
  is_email_verified?: boolean;
  email?: string;
  age_range_needs_agreement?: boolean;
  age_range?: string;
  birthyear_needs_agreement?: boolean;
  birthyear?: string;
  birthday_needs_agreement?: boolean;
  birthday?: string;
  birthday_type?: string;
  gender_needs_agreement?: boolean;
  gender?: 'male' | 'female';
  phone_number_needs_agreement?: boolean;
  phone_number?: string;
  ci_needs_agreement?: boolean;
  ci?: string;
  ci_authenticated_at?: Date;
}

interface Partner {
  uuid?: string;
}

export interface KakaoUserInfo {
  id: number;
  has_signed_up?: boolean;
  connected_at?: Date;
  synched_at?: Date;
  properties?: JSON;
  kakao_account?: KakaoAccount;
  for_partner?: Partner;
}
