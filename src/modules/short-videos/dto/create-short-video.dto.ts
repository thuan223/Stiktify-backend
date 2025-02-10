import { IsNotEmpty, IsString, IsOptional, IsArray, IsBoolean, IsInt, IsMongoId } from 'class-validator';
import { Types } from 'mongoose';

export class CreateShortVideoDto {
  @IsNotEmpty()
  @IsString()
  videoUrl: string;

  @IsOptional()
  @IsString()
  videoDescription: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  videoTag: string[];

  @IsNotEmpty()
  @IsMongoId()
  userId: Types.ObjectId;

  @IsOptional()
  @IsMongoId()
  musicId: Types.ObjectId;

  @IsOptional()
  @IsString()
  videoThumbnail: string;

  @IsOptional()
  @IsBoolean()
  isBlock: boolean;

  @IsOptional()
  @IsBoolean()
  isDeleted: boolean;

  @IsOptional()
  @IsInt()
  totalFavorite: number;

  @IsOptional()
  @IsInt()
  totalReaction: number;

  @IsOptional()
  @IsInt()
  totalViews: number;

  @IsOptional()
  @IsInt()
  totalReports: number; 


}
