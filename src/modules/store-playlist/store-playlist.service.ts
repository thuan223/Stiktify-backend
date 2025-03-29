import { BadRequestException, forwardRef, Inject, Injectable } from '@nestjs/common';
import { CreateStorePlaylistDto } from './dto/create-store-playlist.dto';
import { UpdateStorePlaylistDto } from './dto/update-store-playlist.dto';
import { InjectModel } from '@nestjs/mongoose';
import { StorePlaylist } from './schemas/store-playlist.schema';
import { Model } from 'mongoose';
import { MusicsService } from '../musics/musics.service';
import { PlaylistsService } from '../playlists/playlists.service';
import aqp from 'api-query-params';
import { MusicCategory } from '../music-categories/schemas/music-category.schema';
import { Music } from '../musics/schemas/music.schema';
import { Category } from '../categories/schemas/category.schema';

@Injectable()
export class StorePlaylistService {
  constructor(
    @InjectModel(StorePlaylist.name)
    private storePlaylistModel: Model<StorePlaylist>,
    @InjectModel(Music.name) private musicModel: Model<Music>,
    @InjectModel(MusicCategory.name)
    private musicCategoryModel: Model<MusicCategory>,
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    private readonly musicService: MusicsService,
    @Inject(forwardRef(() => PlaylistsService))
    private playlistService: PlaylistsService,
  ) { }

  async handleFilterSearchStorePlayList(
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
      ? await this.checkFilterCategory(filter.filterReq)
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

  async checkFilterCategory(filter: string) {
    if (!filter || typeof filter !== 'string') return {};
    const category = await this.categoryModel.findOne({
      categoryName: { $regex: filter, $options: 'i' },
    });
    return category ? { categoryId: category._id } : {};
  }

  async checkMusicInPlaylistIsExist(musicId: string, playlistId: string) {
    try {
      const result = await this.storePlaylistModel.findOne({
        musicId: musicId,
        playlistId: playlistId,
      });

      if (result) return result;

      return null;
    } catch (error) {
      return null;
    }
  }

  async handleCreateStoreByPlaylist(
    createStorePlaylistDto: CreateStorePlaylistDto,
  ) {
    const { musicId, playlistId } = createStorePlaylistDto;

    const checkMusicId = await this.musicService.checkMusicById(musicId);

    if (!checkMusicId) {
      throw new BadRequestException(`Not found music with id : ${musicId}`);
    }

    const checkPlaylistId =
      await this.playlistService.checkPlaylistById(playlistId);

    if (!checkPlaylistId) {
      throw new BadRequestException(
        `Not found playlist with id : ${playlistId}`,
      );
    }

    const checkStorePlaylist = await this.checkMusicInPlaylistIsExist(
      musicId,
      playlistId,
    );

    if (checkStorePlaylist) {
      throw new BadRequestException(
        `This song has been added to the playlist!`,
      );
    }

    const result = await this.storePlaylistModel.create({
      musicId: musicId,
      playlistId: playlistId,
    });

    return result;
  }

  async handleFindAllByPlaylistId(
    id: string,
    current: number,
    pageSize: number,
  ) {
    if (!current) current = 1;
    if (!pageSize) pageSize = 10;

    const filter = {
      playlistId: id,
    };

    const totalItems = (await this.storePlaylistModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / pageSize);

    const skip = (+current - 1) * +pageSize;

    // const result = await this.storePlaylistModel.aggregate([
    //   {
    //     $lookup: {
    //       from: "musics", // Tên collection chứa music
    //       localField: "musicId",
    //       foreignField: "_id",
    //       as: "music"
    //     }
    //   },
    //   {
    //     $lookup: {
    //       from: "playlists", // Collection chứa playlist
    //       localField: "playlistId",
    //       foreignField: "_id",
    //       as: "playlist"
    //     }
    //   },
    //   {
    //     $group: {
    //       _id: "$playlistId",
    //       playlist: { $first: { $arrayElemAt: ["$playlist", 0] } }, // Lấy playlist đầu tiên
    //       music: { $push: { $arrayElemAt: ["$music", 0] } } // Gom tất cả music vào mảng
    //     }
    //   },
    //   {
    //     $sort: { _id: -1 } // Sắp xếp theo playlistId mới nhất
    //   }
    // ]);

    const result = await this.storePlaylistModel
      .find(filter)
      .limit(pageSize)
      .skip(skip)
      .populate({
        path: 'playlistId',
      })
      .populate({
        path: 'musicId'
      })
      .sort({ createdAt: -1 });

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

  async handlePlayMusicInPlaylist(
    id: string,
    current: number,
    pageSize: number,
  ) {
    if (!current) current = 1;
    if (!pageSize) pageSize = 10;

    const filter = {
      playlistId: id,
    };

    const totalItems = (await this.storePlaylistModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / pageSize);

    const skip = (+current - 1) * +pageSize;

    const result = await this.storePlaylistModel
      .find(filter)
      .limit(pageSize)
      .skip(skip)
      .populate({
        path: 'musicId',
        select:
          '_id musicUrl musicThumbnail musicLyric musicDescription userId',
      })
      .sort({ createdAt: -1 });

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

  update(id: number, updateStorePlaylistDto: UpdateStorePlaylistDto) {
    return `This action updates a #${id} storePlaylist`;
  }

  async handleDeleteMusicInPlaylist(id: string): Promise<any> {
    const checkMusicId = await this.musicService.checkMusicById(id);

    if (!checkMusicId) {
      throw new BadRequestException(`Not found music with id : ${id}`);
    }

    const result = await this.storePlaylistModel.deleteOne({ musicId: id });
    return result;
  }

  async handleDeletePlaylist(playlistId: string) {
    await this.storePlaylistModel.deleteMany({ _id: playlistId })
    return true
  }
}
