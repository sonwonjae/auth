import { Agent } from 'node:https';

import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { SupabaseService } from 'src/supabase/supabase.service';

import { KakaoController } from './kakao.controller';
import { KakaoService } from './kakao.service';

@Module({
  imports: [
    HttpModule.register({
      httpsAgent: new Agent({
        rejectUnauthorized: false,
      }),
    }),
  ],
  controllers: [KakaoController],
  providers: [KakaoService, SupabaseService],
})
export class KakaoModule {}
