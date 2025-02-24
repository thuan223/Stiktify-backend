import { PartialType } from '@nestjs/mapped-types';
import { CreateMusicFavoriteDto } from './create-music-favorite.dto';

export class UpdateMusicFavoriteDto extends PartialType(CreateMusicFavoriteDto) {}
