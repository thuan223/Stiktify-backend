// src/rating/dto/create-rating.dto.ts
import { IsNumber, IsString, Min, Max } from 'class-validator';

export class CreateRatingDto {
  @IsString()
  orderId: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;
}