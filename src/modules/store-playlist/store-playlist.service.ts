import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateStorePlaylistDto } from './dto/create-store-playlist.dto';
import { UpdateStorePlaylistDto } from './dto/update-store-playlist.dto';
import { InjectModel } from '@nestjs/mongoose';
import { StorePlaylist } from './schemas/store-playlist.schema';
import { Model } from 'mongoose';
import { MusicsService } from '../musics/musics.service';
import { PlaylistsService } from '../playlists/playlists.service';

@Injectable()
export class StorePlaylistService {
  constructor(
    @InjectModel(StorePlaylist.name) private storePlaylistModel: Model<StorePlaylist>,
    private readonly musicService: MusicsService,
    private readonly playlistService: PlaylistsService,
  ) { }

  async checkMusicInPlaylistIsExist(musicId: string, playlistId: string) {
    try {
      const result = await this.storePlaylistModel.findOne({ musicId: musicId, playlistId: playlistId })

      if (result) return result

      return null
    } catch (error) {
      return null
    }
  }

  async handleCreateStoreByPlaylist(createStorePlaylistDto: CreateStorePlaylistDto) {
    const { musicId, playlistId } = createStorePlaylistDto

    const checkMusicId = await this.musicService.checkMusicById(musicId)

    if (!checkMusicId) {
      throw new BadRequestException(`Not found music with id : ${musicId}`)
    }

    const checkPlaylistId = await this.playlistService.checkPlaylistById(playlistId)

    if (!checkPlaylistId) {
      throw new BadRequestException(`Not found playlist with id : ${playlistId}`)
    }

    const checkStorePlaylist = await this.checkMusicInPlaylistIsExist(musicId, playlistId)

    if (checkStorePlaylist) {
      throw new BadRequestException(`This song has been added to the playlist!`)
    }

    const result = await this.storePlaylistModel.create({
      musicId: musicId,
      playlistId: playlistId
    })

    return result
  }

  handleFindAllByPlaylistId(id: string) {
    return `This action returns all storePlaylist: ${id}`;
  }

  findOne(id: number) {
    return `This action returns a #${id} storePlaylist`;
  }

  update(id: number, updateStorePlaylistDto: UpdateStorePlaylistDto) {
    return `This action updates a #${id} storePlaylist`;
  }

  remove(id: number) {
    return `This action removes a #${id} storePlaylist`;
  }
}
