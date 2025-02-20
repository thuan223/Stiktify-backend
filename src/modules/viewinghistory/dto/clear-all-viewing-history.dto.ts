
import {  IsNotEmpty, } from 'class-validator';

export class ClearAllViewingHistoryDto {
  @IsNotEmpty({ message: 'userId must not be empty' })
  userId: string;

}

