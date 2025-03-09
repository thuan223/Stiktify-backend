import { IsNotEmpty } from "class-validator";

export class CreateListeninghistoryDto {
      @IsNotEmpty({ message: 'UserId must not be empty' })
      userId: string;
    
      @IsNotEmpty({ message: 'Music must not be empty' })
      musicId: string;
}
