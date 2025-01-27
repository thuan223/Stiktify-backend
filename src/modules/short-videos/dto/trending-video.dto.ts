import { IsOptional } from 'class-validator';

export class TrendingVideoDto {
  @IsOptional()
  userId?: string; 
}
