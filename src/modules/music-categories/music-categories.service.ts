import { Injectable } from '@nestjs/common';
import { CreateMusicCategoryDto } from './dto/create-music-category.dto';
import { UpdateMusicCategoryDto } from './dto/update-music-category.dto';

@Injectable()
export class MusicCategoriesService {
  create(createMusicCategoryDto: CreateMusicCategoryDto) {
    return 'This action adds a new musicCategory';
  }

  findAll() {
    return `This action returns all musicCategories`;
  }

  findOne(id: number) {
    return `This action returns a #${id} musicCategory`;
  }

  update(id: number, updateMusicCategoryDto: UpdateMusicCategoryDto) {
    return `This action updates a #${id} musicCategory`;
  }

  remove(id: number) {
    return `This action removes a #${id} musicCategory`;
  }
}
