import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMusicCategoryDto } from './dto/create-music-category.dto';
import { UpdateMusicCategoryDto } from './dto/update-music-category.dto';
import { InjectModel } from '@nestjs/mongoose';
import { MusicCategory } from './schemas/music-category.schema';
import { Model, Types } from 'mongoose';
import { MusicsService } from '../musics/musics.service';
import { CategoriesService } from '../categories/categories.service';
import aqp from 'api-query-params';
import { Music } from '../musics/schemas/music.schema';

@Injectable()
export class MusicCategoriesService {
  constructor(
    @InjectModel(MusicCategory.name)
    private musicCategoryModel: Model<MusicCategory>,
    @InjectModel(Music.name) private musicModel: Model<Music>,
    private categoryService: CategoriesService,
  ) {}

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

  async checkFilterAction(filter: string) {
    try {
      if (!filter) {
        return {};
      }
      const result = await this.categoryService.checkCategoryById(filter);
      if (result) {
        return {
          categoryId: new Types.ObjectId(filter),
        };
      }
      return {};
    } catch (error) {
      return {};
    }
  }

  async handleSearchMusic(pageSize: any, handleSearch: any, current: any) {
    const totalItems = (
      await this.musicModel.find({
        $or: handleSearch,
      })
    ).length;
    const totalPages = Math.ceil(totalItems / pageSize);

    const skip = (+current - 1) * +pageSize;
    const result = await this.musicModel
      .find({
        $or: handleSearch,
      })
      .limit(pageSize)
      .skip(skip);

    return {
      meta: {
        current: current,
        pageSize: pageSize,
        pages: totalPages,
        total: totalItems,
      },
      result: result,
    };
  }

  async handleFilterAndSearch(
    query: string,
    current: number,
    pageSize: number,
  ) {
    const { filter, sort } = aqp(query);

    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;

    if (!current) current = 1;
    if (!pageSize) pageSize = 10;

    const handleFilter = await this.checkFilterAction(filter.filterReq);

    const searchRegex = new RegExp(`^${filter.search}`, 'i');

    let handleSearch = [];
    if (filter.search.length > 0) {
      handleSearch = [
        { musicDescription: searchRegex },
        { musicLyric: searchRegex },
      ];
    }

    const isEmptyObject = (obj: object) => Object.keys(obj).length === 0;
    if (isEmptyObject(handleFilter)) {
      return await this.handleSearchMusic(pageSize, handleSearch, current);
    }
    const totalItem = (
      await this.musicCategoryModel.find({ ...handleFilter }).populate({
        path: 'musicId',
        match: { $or: handleSearch },
      })
    ).filter((x) => x.musicId !== null);
    const totalItems = new Set(totalItem.map((item: any) => item.musicId._id))
      .size;

    const totalPages = Math.ceil(totalItems / pageSize);

    const skip = (+current - 1) * +pageSize;

    const result = await this.musicCategoryModel
      .find({
        ...handleFilter,
      })
      .populate({
        path: 'musicId',
        match: { $or: handleSearch },
        // options: {
        //   skip: skip,
        //   limit: pageSize,
        //   sort: sort as any
        // }
      });
    // .limit(pageSize)
    // .skip(skip)
    // .sort(sort as any);

    const configResult = result.slice(current - 1, pageSize);
    const configData = result
      .map((item) => item.musicId)
      .filter((music) => music);
    const uniqueData = Array.from(
      new Map(configData.map((item: any) => [item._id, item])).values(),
    );
    return {
      meta: {
        current: current, // trang hien tai
        pageSize: pageSize, // so luong ban ghi
        pages: totalPages, // tong so trang voi dieu kien query
        total: totalItems, // tong so ban ghi
      },
      result: uniqueData,
    };
  }
  async getMusicCategoriesByMusicId(musicId: string) {
    return await this.musicCategoryModel.find({ musicId });
  }
}
