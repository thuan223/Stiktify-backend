import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
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
    private readonly musicService: MusicsService,
  ) { }

  async checkUserPlaylist(userId: string, musicId: string) {
    try {
      const result = await this.playlistModel
        .findOne(
          {
            userId: new Types.ObjectId(userId),
            musicId: new Types.ObjectId(musicId),
          })

      if (result) return true

      return false
    } catch (error) {
      return false
    }
  }

  async handleAddPlaylist(createPlaylistDto: CreatePlaylistDto) {
    const { musicId, userId } = createPlaylistDto
    const checkUser = await this.userService.checkUserById(userId)

    if (!checkUser) {
      throw new BadRequestException(`User not exist with user id: ${userId}`)
    }

    const checkMusic = await this.musicService.checkMusicById(musicId)

    if (!checkMusic) {
      throw new BadRequestException(`Music not exist with music id: ${musicId}`)
    }

    const checkPlaylist = await this.checkUserPlaylist(userId, musicId)

    if (checkPlaylist) {
      throw new BadRequestException(`Music has been added to the playlist!`)
    }

    const countPlaylist = await this.playlistModel.countDocuments({ userId: userId })

    if (countPlaylist >= 100) {
      throw new ForbiddenException(`Music has been added to the playlist!`)
    }

    const result = await this.playlistModel
      .create({
        userId: userId,
        musicId: musicId
      })

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

  remove(id: number) {
    return `This action removes a #${id} playlist`;
  }
}
