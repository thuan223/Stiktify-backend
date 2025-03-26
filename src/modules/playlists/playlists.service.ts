import { BadRequestException, ForbiddenException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Playlist } from './schemas/playlist.schema';
import { Model, Types } from 'mongoose';
import { UsersService } from '../users/users.service';
import { Category } from '../categories/schemas/category.schema';
import { MusicCategory } from '../music-categories/schemas/music-category.schema';
import aqp from 'api-query-params';
import { StorePlaylistService } from '../store-playlist/store-playlist.service';

@Injectable()
export class PlaylistsService {
  constructor(
    @InjectModel(Playlist.name) private playlistModel: Model<Playlist>,
    private readonly userService: UsersService,
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    @InjectModel(MusicCategory.name) private musicCategoryModel: Model<MusicCategory>,
    @Inject(forwardRef(() => StorePlaylistService))
    private storePlaylistService: StorePlaylistService,
  ) { }

  async checkPlaylistById(id: string) {
    try {
      const result = await this.playlistModel.findById(id)
      if (result) {
        return result
      }
      return null
    } catch (error) {
      return null
    }
  }

  async handleAddPlaylist(createPlaylistDto: CreatePlaylistDto) {
    const { userId, description, image, name } = createPlaylistDto
    const checkUser = await this.userService.checkUserById(userId)

    if (!checkUser) {
      throw new BadRequestException(`User not exist with user id: ${userId}`)
    }

    if (!name) {
      throw new BadRequestException(`Missing field required!`)
    }
    const count = await this.playlistModel.countDocuments({ userId: userId })

    if (count >= 3) {
      throw new BadRequestException("Please upgrade to Premium to continue using this feature.")
    }

    const result = await this.playlistModel.create({ userId: userId, name: name, description: description, image: image })

    return result
  }
  async handleListPlaylist(userId: string, current: number, pageSize: number) {
    if (!current) current = 1;
    if (!pageSize) pageSize = 10;

    const filter = {
      userId: new Types.ObjectId(userId)
    }

    const totalItems = (await this.playlistModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / pageSize);

    const skip = (+current - 1) * +pageSize;

    const result = await this.playlistModel
      .find(filter)
      .limit(pageSize)
      .skip(skip)
      .populate(
        {
          path: "userId",
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

  async handleGetDetailPlaylist(id: string, current: number, pageSize: number) {
    if (!current) current = 1;
    if (!pageSize) pageSize = 10;

    const filter = {
      _id: id
    }

    const totalItems = (await this.playlistModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / pageSize);

    const skip = (+current - 1) * +pageSize;

    const result = await this.playlistModel
      .find(filter)
      .limit(pageSize)
      .skip(skip)
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

  async checkFilterPlaylist(filter: string) {
    if (!filter || typeof filter !== 'string') return {};
    const category = await this.categoryModel.findOne({ categoryName: { $regex: filter, $options: 'i' } });
    return category ? { categoryId: category._id } : {};
  }

  async handleFilterAndSearchPlaylist(query: any, current: number, pageSize: number) {
    const { filter = {}, sort = {} } = aqp(query);
    current = current && !isNaN(Number(current)) ? Number(current) : 1;
    pageSize = pageSize && !isNaN(Number(pageSize)) ? Number(pageSize) : 10;
    if (isNaN(current) || isNaN(pageSize)) {
      return { statusCode: 400, message: "Invalid pagination parameters" };
    }
    const handleFilter = filter.filterReq ? await this.checkFilterPlaylist(filter.filterReq) : {};
    let handleSearch = [];
    if (filter.search && typeof filter.search === "string" && filter.search.trim().length > 0) {
      const searchRegex = new RegExp(filter.search, 'i');
      handleSearch = [
        { musicDescription: searchRegex },
      ];
    }
    let musicCategory = [];
    if (handleFilter.categoryId) {
      musicCategory = await this.musicCategoryModel.find({ categoryId: handleFilter.categoryId });
    }
    const musicIds = musicCategory.map(item => item.musicId);
    const filterQuery = {
      ...(handleSearch.length > 0 ? { $or: handleSearch } : {}),
      ...(handleFilter.categoryId ? { _id: { $in: musicIds } } : {}),
    };
    const totalItems = await this.playlistModel.countDocuments(filterQuery);
    const totalPages = Math.ceil(totalItems / pageSize);
    const skip = (current - 1) * pageSize;
    const result = await this.playlistModel
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

  findOne(id: number) {
    return `This action returns a #${id} playlist`;
  }

  update(id: number, updatePlaylistDto: UpdatePlaylistDto) {
    return `This action updates a #${id} playlist`;
  }

  async checkPlaylistIsExist(id: string) {
    try {
      const result = await this.playlistModel.findById(id)
      if (result) return true

      return false
    } catch (error) {
      return false
    }
  }

  async handleDeletePlaylist(id: string) {
    const check = await this.checkPlaylistIsExist(id)

    if (!check) {
      throw new NotFoundException(`Not found playlist with id: ${id}`)
    }
    await this.storePlaylistService.handleDeletePlaylist(id)
    const result = await this.playlistModel.findByIdAndDelete(id)
    return result
  }
}
