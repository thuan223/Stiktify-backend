import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMusicCategoryDto } from './dto/create-music-category.dto';
import { UpdateMusicCategoryDto } from './dto/update-music-category.dto';
import { InjectModel } from '@nestjs/mongoose';
import { MusicCategory } from './schemas/music-category.schema';
import { Model } from 'mongoose';
import { MusicsService } from '../musics/musics.service';
import { CategoriesService } from '../categories/categories.service';

@Injectable()
export class MusicCategoriesService {
  constructor(
    @InjectModel(MusicCategory.name) private musicCategoryModel: Model<MusicCategory>,
  ) { }

  async handleCreateCategoryMusic(categoryId: string[], musicId: string) {
    for (const e of categoryId) {
      await this.musicCategoryModel.create({ categoryId: e, musicId: musicId });
    }
    return;
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
