import { IsNotEmpty } from 'class-validator';

export class CreateWishlistDto {
  @IsNotEmpty({ message: 'id must not be empty' })
  id?: string;
  @IsNotEmpty({ message: 'userId must not be empty' })
  userId?: string;
  @IsNotEmpty({ message: 'Trigger action must not be empty' })
  triggerAction?: string;
}
