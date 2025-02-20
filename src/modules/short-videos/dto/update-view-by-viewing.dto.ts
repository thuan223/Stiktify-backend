import { IsNotEmpty } from 'class-validator';

export class UpdateVideoByViewingDto {
  @IsNotEmpty({ message: 'videoId must not be empty' })
  videoId: string;
}
