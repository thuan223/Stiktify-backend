
import {  IsNotEmpty, } from 'class-validator';

export class ClearOneViewingHistoryDto {
  @IsNotEmpty({ message: 'id must not be empty' })
  id: string;

}

