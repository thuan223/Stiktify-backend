import { Injectable } from '@nestjs/common';
import { CreateMusicFavoriteDto } from './dto/create-music-favorite.dto';
import { UpdateMusicFavoriteDto } from './dto/update-music-favorite.dto';

@Injectable()
export class MusicFavoriteService {
  create(createMusicFavoriteDto: CreateMusicFavoriteDto) {
    return 'This action adds a new musicFavorite';
  }

  findAll() {
    return `This action returns all musicFavorite`;
  }

  findOne(id: number) {
    return `This action returns a #${id} musicFavorite`;
  }

  update(id: number, updateMusicFavoriteDto: UpdateMusicFavoriteDto) {
    return `This action updates a #${id} musicFavorite`;
  }

  remove(id: number) {
    return `This action removes a #${id} musicFavorite`;
  }
}
