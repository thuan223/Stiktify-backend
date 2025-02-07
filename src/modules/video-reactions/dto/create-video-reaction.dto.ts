import { IsNotEmpty, IsMongoId } from 'class-validator';
import { Types } from 'mongoose';

export class CreateVideoReactionDto {
  @IsMongoId()
  @IsNotEmpty()
  videoId: Types.ObjectId;

  @IsMongoId()
  @IsNotEmpty()
  reactionTypeId: Types.ObjectId;
}

export class GetReaction {
  @IsMongoId()
  @IsNotEmpty()
  videoId: Types.ObjectId;
}
