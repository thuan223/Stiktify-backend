import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { StorePlaylistService } from './store-playlist.service';
import { CreateStorePlaylistDto } from './dto/create-store-playlist.dto';
import { UpdateStorePlaylistDto } from './dto/update-store-playlist.dto';

@Controller('store-playlist')
export class StorePlaylistController {
  constructor(private readonly storePlaylistService: StorePlaylistService) { }

  @Post("create-store-playlist")
  createStoreByPlaylist(@Body() createStorePlaylistDto: CreateStorePlaylistDto) {
    return this.storePlaylistService.handleCreateStoreByPlaylist(createStorePlaylistDto);
  }

  @Get("list-music-playlist/:id")
  findAllByPlaylistId(
    @Param('id') id: string,
    @Query("current") current: number,
    @Query("pageSize") pageSize: number,
  ) {
    return this.storePlaylistService.handleFindAllByPlaylistId(id, +current, +pageSize);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.storePlaylistService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStorePlaylistDto: UpdateStorePlaylistDto) {
    return this.storePlaylistService.update(+id, updateStorePlaylistDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.storePlaylistService.remove(+id);
  }
}
