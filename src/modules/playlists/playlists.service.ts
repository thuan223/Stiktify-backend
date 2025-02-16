import { Injectable } from '@nestjs/common';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Playlist } from './schemas/playlist.schema';
import { Model, Types } from 'mongoose';

@Injectable()
export class PlaylistsService {
  constructor(
    @InjectModel(Playlist.name) private playlistModel: Model<Playlist>,
  ) { }

  create(createPlaylistDto: CreatePlaylistDto) {
    return 'This action adds a new playlist';
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
    // .sort(sort as any);

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
