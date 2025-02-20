import { Injectable } from '@nestjs/common';
import { CreateStorePlaylistDto } from './dto/create-store-playlist.dto';
import { UpdateStorePlaylistDto } from './dto/update-store-playlist.dto';

@Injectable()
export class StorePlaylistService {
  create(createStorePlaylistDto: CreateStorePlaylistDto) {
    return 'This action adds a new storePlaylist';
  }

  findAll() {
    return `This action returns all storePlaylist`;
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
