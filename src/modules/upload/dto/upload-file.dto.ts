import { IsNotEmpty } from 'class-validator';

export class UploadImageDto {
  @IsNotEmpty({ message: 'folder must not be empty' })
  folder: string;
}
