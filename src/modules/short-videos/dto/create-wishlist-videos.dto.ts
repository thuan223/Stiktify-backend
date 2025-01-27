import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateWishListVideoDto {
    @IsNotEmpty({ message: 'videoId must not be empty' })
  videoId?: string; 
  @IsNotEmpty({ message: 'userId must not be empty' })
  userId?: string; 
}
