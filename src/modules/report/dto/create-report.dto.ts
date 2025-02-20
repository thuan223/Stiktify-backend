import { IsNotEmpty, IsString, IsMongoId } from 'class-validator';
import { Types } from 'mongoose';

export class CreateReportDto {
  @IsNotEmpty()
  @IsMongoId()
  videoId: Types.ObjectId;
  
  @IsNotEmpty()
  @IsMongoId()
  userId: Types.ObjectId;

  @IsNotEmpty()
  @IsString()
  reasons: string;

}
