import { Tables } from 'src/supabase/supabase.types';

export interface UserInfo extends Partial<Tables<'users'>> {
  name: string;
  email: string;
  providerId: string;
}

export interface RegistUserOptions {
  userInfo: UserInfo;
}
