import { IsNotEmpty, IsMongoId } from 'class-validator';
import { Types } from 'mongoose';

export class DeleteVideoReactionDto {
  @IsMongoId()
  @IsNotEmpty()
  videoId: string;
}
