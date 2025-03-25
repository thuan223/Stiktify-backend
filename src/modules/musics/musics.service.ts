import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateMusicDto } from './dto/create-music.dto';
import { UpdateMusicDto } from './dto/update-music.dto';
import aqp from 'api-query-params';
import { InjectModel } from '@nestjs/mongoose';
import { Music } from './schemas/music.schema';
import mongoose, { Model, Types } from 'mongoose';
import { Category } from '../categories/schemas/category.schema';
import { MusicCategory } from '../music-categories/schemas/music-category.schema';
import { MusicCategoriesService } from '../music-categories/music-categories.service';
import { CategoriesService } from '../categories/categories.service';
import { QueryRepository } from '../neo4j/neo4j.service';

@Injectable()
export class MusicsService {
  constructor(
    @InjectModel(Music.name) private musicModel: Model<Music>,
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    @InjectModel(MusicCategory.name)
    private musicCategoryModel: Model<MusicCategory>,
    private musicCategoryService: MusicCategoriesService,
    private categoryService: CategoriesService,
    private readonly queryRepository: QueryRepository
  ) { }

  async checkMusicById(id: string) {
    try {
      const result = await this.musicModel
        .findById(id)
        .populate({
          path: 'userId',
          select: '_id userName fullname email',
          match: { isBan: false },
        })
        .where({ isBlock: false });

      if (result) {
        return result;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  async handleUploadMusic(createMusicDto: CreateMusicDto) {
    const { musicTag, categoryId, musicDescription, musicLyric, musicThumbnail, musicUrl, userId } = createMusicDto;

    for (const e of musicTag) {
      if (typeof e !== 'string') {
        throw new BadRequestException('musicTag must be array string!');
      }
    }

    for (const e of categoryId) {
      if (typeof e !== 'string') {
        throw new BadRequestException('categoryId must be array string!');
      } else {
        const checkCategoryId = await this.categoryService.checkCategoryById(e);
        if (!checkCategoryId) {
          throw new NotFoundException(`Not found categoryId with id ${e}`)
        }
      }
    }

    const result = await this.musicModel.create({
      userId: userId,
      musicDescription: musicDescription,
      musicLyric: musicLyric,
      musicThumbnail: musicThumbnail,
      musicUrl: musicUrl,
      listeningAt: new Date()
    });
    await this.musicCategoryService.handleCreateCategoryMusic(categoryId, result._id + "")
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
      updatedAt: { $gte: oneWeekAgo },
    };

    const allItems = await this.musicModel
      .find(filter)
      .sort({ totalListener: -1 })
      .limit(maxLimit);
    const totalItems = allItems.length;
    const totalPages = Math.ceil(totalItems / limit);

    const result = allItems
      .slice(skip, skip + limit)
      .map((item) => item.toObject());

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
      isBlock: false,
      isDelete: false,
      flag: false
    };

    const totalItems = (await this.musicModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / pageSize);

    const skip = (+current - 1) * +pageSize;

    const result = await this.musicModel
      .find(filter)
      .limit(pageSize)
      .skip(skip)
      .populate({
        path: 'userId',
        select: '_id userName fullname email',
        match: { isBan: false },
      })
      .sort({ totalListener: -1 });

    const configData = result.filter((x) => x.userId !== null);
    return {
      meta: {
        current: current,
        pageSize: pageSize,
        pages: totalPages,
        total: totalItems,
      },
      result: configData,
    };
  }

  async handleUpdateListener(id: string) {
    const check = await this.checkMusicById(id);

    if (!check) {
      throw new NotFoundException(`Not found music with id: ${id}`);
    }
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    let result = [];

    if (!check.listeningAt || check.listeningAt < sevenDaysAgo) {
      result = await this.musicModel.findByIdAndUpdate(id, {
        totalListener: check.totalListener + 1, totalListeningOnWeek: 1, listeningAt: new Date()
      });
    } else {
      result = await this.musicModel.findByIdAndUpdate(id, {
        totalListener: check.totalListener + 1, totalListeningOnWeek: check.totalListeningOnWeek + 1
      });
    }

    return result;
  }

  remove(id: number) {
    return `This action removes a #${id} music`;
  }

  async handleMyMusic(userId: string, current: number, pageSize: number) {
    const filter = { userId: new mongoose.Types.ObjectId(userId) };
    const result = await this.musicModel
    .find(filter)
    .skip((current - 1) * pageSize)
    .limit(pageSize)
    .sort({ createdAt: -1 })
    .populate('userId', 'musicId');
    if (result.length == 0){
      return {
        meta: {
          current,
          pageSize,
          totalItems: 0,
          totalPages: 0,
        },
        result: [],
        message: 'No musics found for this user',
      };
    }
    return {
      meta: {
        current,
        pageSize,
        totalItems: result.length,
        totalPages: Math.ceil(result.length / pageSize),
      },
      result,
    };
  }

  async checkFilterMusic(filter: string) {
    if (!filter || typeof filter !== 'string') return {};
    const category = await this.categoryModel.findOne({
      categoryName: { $regex: filter, $options: 'i' },
    });
    return category ? { categoryId: category._id } : {};
  }

  async handleFilterAndSearchMusic(
    query: any,
    current: number,
    pageSize: number,
  ) {
    const { filter = {}, sort = {} } = aqp(query);
    current = current && !isNaN(Number(current)) ? Number(current) : 1;
    pageSize = pageSize && !isNaN(Number(pageSize)) ? Number(pageSize) : 10;
    if (isNaN(current) || isNaN(pageSize)) {
      return { statusCode: 400, message: 'Invalid pagination parameters' };
    }
    const handleFilter = filter.filterReq
      ? await this.checkFilterMusic(filter.filterReq)
      : {};
    let handleSearch = [];
    if (
      filter.search &&
      typeof filter.search === 'string' &&
      filter.search.trim().length > 0
    ) {
      const searchRegex = new RegExp(filter.search, 'i');
      handleSearch = [{ musicDescription: searchRegex }];
    }
    let musicCategory = [];
    if (handleFilter.categoryId) {
      musicCategory = await this.musicCategoryModel.find({
        categoryId: handleFilter.categoryId,
      });
    }
    const musicIds = musicCategory.map((item) => item.musicId);
    const filterQuery = {
      ...(handleSearch.length > 0 ? { $or: handleSearch } : {}),
      ...(handleFilter.categoryId ? { _id: { $in: musicIds } } : {}),
    };
    const totalItems = await this.musicModel.countDocuments(filterQuery);
    const totalPages = Math.ceil(totalItems / pageSize);
    const skip = (current - 1) * pageSize;
    const result = await this.musicModel
      .find(filterQuery)
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
    console.log(id);

    const result = await this.checkMusicById(id);
    if (!result) {
      throw new NotFoundException(`Not found music with id: ${id}`);
    }

    return result;
  }


  // Share a music - ThangLH
  async shareMusic(id: string): Promise<{
    musicUrl: string;
    musicDescription: string;
    musicThumbnail: string;
    totalListener: number;
    totalReactions: number;
  }> {
    const music = await this.musicModel.findById(id).select(
      'musicUrl musicDescription musicThumbnail totalListener totalReactions'
    );

    if (!music) {
      throw new BadRequestException('Music not found');
    }

    return {
      musicUrl: music.musicUrl,
      musicDescription: music.musicDescription,
      musicThumbnail: music.musicThumbnail,
      totalListener: music.totalListener,
      totalReactions: music.totalReactions,
    };
  }

  async isIdExist(id: string) {
    try {
      const result = await this.musicModel.exists({ _id: id });
      if (result) return true;
      return false;
    } catch (error) {
      return false;
    }
  }

  async checkMusicRById(id: string) {
    try {
      const result = await this.musicModel
        .findById(id)
        .populate('userId', 'userName')
        .select('-totalComment -totalReaction')
        .where({ isDelete: false });

      if (result) {
        return result;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  async handleFlagVideo(_id: string, flag: boolean) {
    const checkId = await this.isIdExist(_id);
    if (checkId === false) {
      throw new BadRequestException(`Music not found with ID: ${_id}`);
    } else {
      const result = await this.musicModel.findByIdAndUpdate(_id, {
        flag: flag,
      });
      // await this.reportService.remove(_id)
      return result._id;
    }
  }


  async handleListAllMusicAdmin(query: string, current: number, pageSize: number) {
    try {
      const { filter, sort } = aqp(query);
      if (filter.current) delete filter.current;
      if (filter.pageSize) delete filter.pageSize;
      if (!current) current = 1;
      if (!pageSize) pageSize = 10;
      const totalItems = (
        await this.musicModel.find(filter)
      ).length;
      const totalPages = Math.ceil(totalItems / pageSize);
      const skip = (+current - 1) * +pageSize;
      const result = await this.musicModel
        .find(filter)
        .limit(pageSize)
        .skip(skip)
        .sort(sort as any)
        .populate('userId')
      return {
        meta: {
          current: current, // trang hien tai
          pageSize: pageSize, // so luong ban ghi
          pages: totalPages, // tong so trang voi dieu kien query
          total: totalItems, // tong so ban ghi
        },
        result: result,
      };
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async handleRecommendMusic(userId: string) {
    const similarUsers = await this.queryRepository.initQuery().raw(`
      MATCH (u1:User {id: $userId})-[:LISTENED_TO]->(m:Music)<-[:LISTENED_TO]-(u2:User)
      WHERE u1 <> u2
      WITH u2, COUNT(m) AS commonMusicCount
      ORDER BY commonMusicCount DESC
      LIMIT 5
      RETURN u2.id AS similarUserId
  `, { userId }).run();

    const similarUserIds = similarUsers.map(user => user.similarUserId);

    if (similarUserIds.length === 0) return [];

    const recommendations = await this.queryRepository.initQuery().raw(`
      MATCH (u1:User {id: $userId})-[:LISTENED_TO]->(m:Music)
      WITH COLLECT(m) AS listenedMusic
      MATCH (u2:User)-[:LISTENED_TO]->(m2:Music)
      WHERE u2.id IN $similarUserIds AND NOT m2 IN listenedMusic
      RETURN DISTINCT m2.id AS recommendedMusicId
      LIMIT 10
  `, { userId, similarUserIds }).run();

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dataNeo4j = recommendations.map(music => music.recommendedMusicId);
    const musicHot = await this.musicModel
      .find({ listeningAt: { $gte: sevenDaysAgo } })
      .limit(10 - dataNeo4j.length)
      .sort({ totalListeningOnWeek: -1 })

    const results = await this.musicModel.find({ _id: { $in: dataNeo4j } });

    const mergedArray = [...new Set([...results, ...musicHot])];
    return mergedArray
  }

  async handleListenMusicNeo4j(userId: Types.ObjectId, musicId: Types.ObjectId) {
    const query = await this.queryRepository.initQuery().raw(`
      MERGE (u:User {id: $userId})
      MERGE (m:Music {id: $musicId})
      MERGE (u)-[:LISTENED_TO]->(m)
  `, { userId, musicId }).run();
    return query
  }

  // Getall music id - ThanglH
async getAllMusic(): Promise<Music[]> {
  return this.musicModel.find().exec();
}

}

