import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateCommentDto {
  @IsNotEmpty()
  @IsString()
  readonly commentId: string;

  @IsOptional()
  @IsString()
  readonly CommentDescription?: string;
}

export class DeleteCommentDto {
  @IsNotEmpty()
  @IsString()
  readonly commentId: string;
}
