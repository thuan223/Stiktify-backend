import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { StorePlaylistService } from './store-playlist.service';
import { CreateStorePlaylistDto } from './dto/create-store-playlist.dto';
import { UpdateStorePlaylistDto } from './dto/update-store-playlist.dto';
import { Public, ResponseMessage } from '@/decorator/customize';

@Controller('store-playlist')
export class StorePlaylistController {
  constructor(private readonly storePlaylistService: StorePlaylistService) { }

  @ResponseMessage("Add successfully")
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

  @Delete('delete-music-playlist/:id')
  deleteMusicInPlaylist(@Param('id') id: string) {
    return this.storePlaylistService.handleDeleteMusicInPlaylist(id);
  }

  @Get("list-music-playlist/:id")
  playMusicInPlaylist(
    @Param('id') id: string,
    @Query("current") current: number,
    @Query("pageSize") pageSize: number,
  ) {
    return this.storePlaylistService.handlePlayMusicInPlaylist(id, +current, +pageSize);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStorePlaylistDto: UpdateStorePlaylistDto) {
    return this.storePlaylistService.update(+id, updateStorePlaylistDto);
  }

  @Public()
  @Get("filter-search")
  findStorePlayListFilterAndSearch(
    @Query() query: any,
    @Query("current") current: string,
    @Query("pageSize") pageSize: string,
  ) {
    return this.storePlaylistService.handleFilterSearchStorePlayList(query, +current, +pageSize)
  }

}
