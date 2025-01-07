import { IsString } from 'class-validator';

export class DeleteAuthDto {
  @IsString()
  reason: string;
  suggestion: string;
}
