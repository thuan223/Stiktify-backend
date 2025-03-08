import { PartialType } from '@nestjs/mapped-types';
import { IsNumber, IsBoolean, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

class NumberOfCountDto {
  @IsNumber()
  wishListCount: number;

  @IsNumber()
  wishListScoreCount: number;
}

class ResetScoreDto {
  @IsNumber()
  discountScore: number;

  @IsBoolean()
  wasCheckScore: boolean;
}

class NumberVideoSuggestDto {
  @IsNumber()
  triggerAction: number;

  @IsNumber()
  collaboration: number;

  @IsNumber()
  trending: number;

  @IsNumber()
  random: number;
}

class CollaborativeFilteringDto {
  @IsNumber()
  numberCollaborator: number;

  @IsNumber()
  numberWishListVideo: number;
}

class ScoreIncreaseDto {
  @IsNumber()
  watchVideo: number;

  @IsNumber()
  reactionAboutVideo: number;

  @IsNumber()
  reactionAboutMusic: number;

  @IsNumber()
  clickLinkMusic: number;

  @IsNumber()
  followCreator: number;

  @IsNumber()
  listenMusic: number;

  @IsNumber()
  commentVideo: number;

  @IsNumber()
  searchVideo: number;

  @IsNumber()
  searchMusic: number;

  @IsNumber()
  shareVideo: number;
}

export class UpdateSettingDto {
  @IsOptional()
  @Type(() => NumberOfCountDto)
  numberOfCount?: NumberOfCountDto;

  @IsOptional()
  @Type(() => ResetScoreDto)
  resetScore?: ResetScoreDto;

  @IsOptional()
  @Type(() => NumberVideoSuggestDto)
  numberVideoSuggest?: NumberVideoSuggestDto;

  @IsOptional()
  @Type(() => CollaborativeFilteringDto)
  collaborativeFiltering?: CollaborativeFilteringDto;

  @IsOptional()
  @Type(() => ScoreIncreaseDto)
  scoreIncrease?: ScoreIncreaseDto;
}
