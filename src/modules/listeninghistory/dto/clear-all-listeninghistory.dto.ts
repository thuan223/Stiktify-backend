import {  IsNotEmpty, } from 'class-validator';

export class ClearAllListeningHistoryDto {
  @IsNotEmpty({ message: 'userId must not be empty' })
  userId: string;
}