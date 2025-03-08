import { Optional } from '@nestjs/common';
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
  @IsNotEmpty()
  commentId: Types.ObjectId;
}

export class LikeMusicCommentDto {
  @IsNotEmpty()
  commentId: Types.ObjectId;
}
