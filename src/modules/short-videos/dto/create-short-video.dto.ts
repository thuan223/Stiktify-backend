import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsArray,
  IsBoolean,
  IsInt,
  IsMongoId,
} from 'class-validator';
import { Types } from 'mongoose';

export class CreateShortVideoDto {
  @IsNotEmpty()
  videoUrl: string;

  @IsOptional()
  @IsString()
  videoDescription: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  videoTag: string[];

  @IsNotEmpty()
  userId: string;

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

  @IsOptional()
  @IsArray()
  categories: Types.ObjectId[];
}
