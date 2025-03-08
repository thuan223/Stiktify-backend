import { IsNotEmpty, IsString } from 'class-validator';

export class CreateFriendRequestDto {
  @IsString()
  @IsNotEmpty()
  senderId: string;

  @IsString()
  @IsNotEmpty()
  receiverId: string;
}
