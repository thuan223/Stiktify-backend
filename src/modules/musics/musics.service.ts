import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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
    @InjectModel(Music.name) private musicModel: Model<Music>,
    @InjectModel(Category.name) private categoryModel: Model<Category>
  ) { }

  async checkMusicById(id: string) {
    try {
      const result = await this.musicModel.findById(id).where({ isBlock: false })

      console.log(result);

      if (result) {
        return result
      }
      return null
    } catch (error) {
      return null
    }
  }

  async handleUploadMusic(createMusicDto: CreateMusicDto) {
    const { musicTag } = createMusicDto

    for (const e of musicTag) {
      if (typeof e !== "string") {
        throw new BadRequestException("musicTag must be array string!")
      }
    }

    const result = await this.musicModel.create(createMusicDto)

    return result;
  }

  async handleListHotMusic(current: number, pageSize: number) {
    const currentPage = Math.max(1, Number(current) || 1);
    const limit = Number(pageSize) || 10;
    const maxLimit = 20;
    const skip = (currentPage - 1) * limit;
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const filter = {
      isBlock: false,
      updatedAt: { $gte: oneWeekAgo }
    };

    const allItems = await this.musicModel.find(filter).sort({ totalListener: -1 }).limit(maxLimit);
    const totalItems = allItems.length;
    const totalPages = Math.ceil(totalItems / limit);

    const result = allItems.slice(skip, skip + limit).map((item) => item.toObject());

    return {
      meta: {
        current: currentPage,
        pageSize: limit,
        pages: totalPages,
        total: totalItems,
      },
      result,
    };
  }

  async handleListMusic(current: number, pageSize: number) {
    if (!current) current = 1;
    if (!pageSize) pageSize = 10;

    const filter = {
      isBlock: false
    }

    const totalItems = (await this.musicModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / pageSize);

    const skip = (+current - 1) * +pageSize;

    const result = await this.musicModel
      .find(filter)
      .limit(pageSize)
      .skip(skip)
      .populate(
        {
          path: "userId",
          select: "_id userName fullname email",
          match: { isBan: false }
        })
      .sort({ totalListener: -1 });

    const configData = result.filter(x => x.userId !== null)
    return {
      meta: {
        current: current,
        pageSize: pageSize,
        pages: totalPages,
        total: totalItems,
      },
      result: configData
    };
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

  async handleDisplayMusic(id: string) {
    const result = await this.checkMusicById(id);
    if (!result) {
      throw new NotFoundException(`Not found music with id: ${id}`)
    }
    return result
  }
}