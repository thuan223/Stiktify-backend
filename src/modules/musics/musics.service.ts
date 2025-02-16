import { Injectable } from '@nestjs/common';
import { CreateMusicDto } from './dto/create-music.dto';
import { UpdateMusicDto } from './dto/update-music.dto';
import aqp from 'api-query-params';
import { InjectModel } from '@nestjs/mongoose';
import { Music } from './schemas/music.schema';
import { Model } from 'mongoose';
import { Category } from '../categories/schemas/category.schema';

@Injectable()
export class MusicsService {
    constructor(
      @InjectModel
      (Music.name) private musicModel: Model<Music>,
      @InjectModel(Category.name) private categoryModel: Model<Category>
    ) {}
  create(createMusicDto: CreateMusicDto) {
    return 'This action adds a new music';
  }

  findAll() {
    return `This action returns all musics`;
  }

  findOne(id: number) {
    return `This action returns a #${id} music`;
  }

  update(id: number, updateMusicDto: UpdateMusicDto) {
    return `This action updates a #${id} music`;
  }

  remove(id: number) {
    return `This action removes a #${id} music`;
  }

  async checkFilterMusic(filter: string) {
    if (!filter || typeof filter !== 'string') return {};
    const category = await this.categoryModel.findOne({ name: filter });
    return category ? { genre: filter } : {};
}


async handleFilterAndSearchMusic(query: any, current: number, pageSize: number) {
  const { filter = {}, sort = {} } = aqp(query);
  if (filter && filter.current) delete filter.current;
  if (filter && filter.pageSize) delete filter.pageSize;
  if (sort && sort.pageSize) delete sort.pageSize;
  current = current && !isNaN(Number(current)) ? Number(current) : 1;
  pageSize = pageSize && !isNaN(Number(pageSize)) ? Number(pageSize) : 10;

  if (isNaN(current) || isNaN(pageSize)) {
      return { statusCode: 400, message: "Invalid pagination parameters" };
  }
  const totalItems = await this.musicModel.countDocuments(filter);
  const totalPages = Math.ceil(totalItems / pageSize);
  const skip = (current - 1) * pageSize;
  let handleSearch = [];
  if (filter.search && typeof filter.search === "string" && filter.search.trim().length > 0) {
      const searchRegex = new RegExp(filter.search, 'i');
      handleSearch = [
          { musicDescription: searchRegex },
          { musicLyric: searchRegex }
      ];
  }
  const handleFilter = filter.filterReq ? await this.checkFilterMusic(filter.filterReq) : {};
  const result = await this.musicModel
      .find({
          ...handleFilter,
          ...(handleSearch.length > 0 ? { $or: handleSearch } : {})
      })
      .limit(pageSize)
      .skip(skip)
      .sort(sort as any);
  return {
      meta: {
          current,
          pageSize,
          total: totalItems,
          pages: totalPages,
      },
      result,
  };
}

  
}
