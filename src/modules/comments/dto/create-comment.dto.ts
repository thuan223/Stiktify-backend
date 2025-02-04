import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  videoId: string;

  @IsString()
  @IsNotEmpty()
  CommentDescription: string;

  @IsOptional()
  @IsString()
  parent?: string;
}
