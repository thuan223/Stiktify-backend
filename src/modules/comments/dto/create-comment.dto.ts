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

export class ReplyCommentDto {
  @IsString()
  @IsNotEmpty()
  videoId: string;

  @IsString()
  @IsNotEmpty()
  parentId: string;

  @IsString()
  @IsNotEmpty()
  CommentDescription: string;
}

export class CreateMusicCommentDto {
  @IsString()
  @IsNotEmpty()
  musicId: string;

  @IsString()
  @IsNotEmpty()
  CommentDescription: string;

  @IsOptional()
  @IsString()
  parent?: string;
}
