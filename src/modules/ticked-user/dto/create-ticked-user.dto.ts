import { IsNotEmpty } from 'class-validator';

export class CreateTickedUserDto {
  @IsNotEmpty({ message: 'userId must not be empty' })
  userId: string;
}
