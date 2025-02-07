
import { IsNotEmpty, IsOptional } from 'class-validator';

export class TriggerWishlistScoreDto {
    
    @IsNotEmpty({ message: 'id must not be empty' })
  id?: string; 
  @IsNotEmpty({ message: 'userId must not be empty' })
  userId?: string; 
  @IsNotEmpty({ message: 'Trigger action must not be empty' })
  triggerAction?: string; 
}
