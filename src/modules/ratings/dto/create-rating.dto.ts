import { IsNotEmpty, IsString, IsNumber, Min, Max } from 'class-validator';

export class CreateRatingDto {
  @IsNotEmpty()
  @IsString()
  productId: string;

  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsNumber()
  star: number;
}