import { IsMongoId, IsNotEmpty } from 'class-validator';

export class DeleteCommentReactionDto {
  @IsMongoId()
  @IsNotEmpty()
  commentId: string;
}
