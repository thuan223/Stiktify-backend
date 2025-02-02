
import {  IsNotEmpty, } from 'class-validator';

export class CreateViewinghistoryDto {
  @IsNotEmpty({ message: 'UserId must not be empty' })
  userId: string;

  @IsNotEmpty({ message: 'Email must not be empty' })
  videoId: string;

}

