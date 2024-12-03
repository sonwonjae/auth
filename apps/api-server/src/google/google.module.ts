import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { SupabaseService } from 'src/supabase/supabase.service';

import { GoogleController } from './google.controller';
import { GoogleService } from './google.service';

@Module({
  imports: [HttpModule],
  controllers: [GoogleController],
  providers: [GoogleService, SupabaseService, AuthService],
})
export class GoogleModule {}
