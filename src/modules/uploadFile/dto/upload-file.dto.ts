import { IsString, IsArray, IsOptional } from 'class-validator';

export class CreateVideoDto {
  @IsString()
  videoUrl: string;

  @IsString()
  videoThumbnail: string;

  @IsArray()
  videoTag: string[];

  @IsString()
  videoType: string;
}
