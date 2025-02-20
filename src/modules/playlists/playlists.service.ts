import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Playlist } from './schemas/playlist.schema';
import { Model, Types } from 'mongoose';
import { UsersService } from '../users/users.service';
import { MusicsService } from '../musics/musics.service';

@Injectable()
export class PlaylistsService {
  constructor(
    @InjectModel(Playlist.name) private playlistModel: Model<Playlist>,
    private readonly userService: UsersService,
  ) { }

  async checkPlaylistById(id: string) {
    try {
      const result = await this.playlistModel
        .findById(id)

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

    if (!description || !name || !image) {
      throw new BadRequestException(`Missing field required!`)
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
          path: "musicId",
          match: { isBlock: false },
          populate: {
            path: "userId",
            select: "_id userName fullname"
          }
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

  findOne(id: number) {
    return `This action returns a #${id} playlist`;
  }

  update(id: number, updatePlaylistDto: UpdatePlaylistDto) {
    return `This action updates a #${id} playlist`;
  }

  async checkPlaylistIsExist(id: string, userId: string) {
    try {
      const result = await this.playlistModel.findById(id, { userId: userId })
      if (result) return true

      return false
    } catch (error) {
      return false
    }
  }

  async handleDeletePlaylist(id: string, userId: string) {
    if (!userId) {
      throw new BadRequestException("Missing field required!")
    }

    const check = await this.checkPlaylistIsExist(id, userId)

    if (!check) {
      throw new NotFoundException(`Not found playlist with id: ${id}`)
    }

    const result = await this.playlistModel.findByIdAndDelete(id)
    return result
  }
}
