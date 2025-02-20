import { IsMongoId, IsNotEmpty } from 'class-validator';
import { Types } from 'mongoose';

export class CreateCommentReactionDto {
  @IsMongoId()
  @IsNotEmpty()
  commentId: Types.ObjectId;

  @IsMongoId()
  @IsNotEmpty()
  reactionTypeId: Types.ObjectId;
}

export class GetReaction {
  @IsMongoId()
  @IsNotEmpty()
  commentId: Types.ObjectId;
}
