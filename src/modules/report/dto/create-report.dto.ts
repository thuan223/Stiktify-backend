import { IsNotEmpty, IsString, IsMongoId } from 'class-validator';

export class CreateReportVideoDto {
  @IsNotEmpty()
  @IsMongoId()
  videoId: string;

  @IsNotEmpty()
  @IsMongoId()
  userId: string;

  @IsNotEmpty()
  @IsString()
  reasons: string;
}

export class CreateReportMusicDto {
  @IsNotEmpty()
  @IsMongoId()
  musicId: string;

  @IsNotEmpty()
  @IsMongoId()
  userId: string;

  @IsNotEmpty()
  @IsString()
  reasons: string;
}
