import type { Database } from './supabase.types';

import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private readonly supabase: SupabaseClient<Database>;

  constructor() {
    this.supabase = createClient<Database>(
      process.env.SUPABASE_URL as string,
      process.env.SUPABASE_ANON_KEY as string,
    );
  }

  get client(): SupabaseClient<Database> {
    return this.supabase;
  }
}
