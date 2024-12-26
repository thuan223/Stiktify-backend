import { PartialType } from '@nestjs/mapped-types';
import { CreateMusicCategoryDto } from './create-music-category.dto';

export class UpdateMusicCategoryDto extends PartialType(CreateMusicCategoryDto) {}
