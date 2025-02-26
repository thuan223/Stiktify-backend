import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { PlaylistsService } from './playlists.service';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';
import { ResponseMessage } from '@/decorator/customize';

@Controller('playlists')
export class PlaylistsController {
  constructor(private readonly playlistsService: PlaylistsService) { }

  @Post("add-playlist")
  @ResponseMessage('Added successfully')
  addPlaylist(@Body() createPlaylistDto: CreatePlaylistDto) {
    return this.playlistsService.handleAddPlaylist(createPlaylistDto);
  }

  @Get("filter-search")
  findPlaylistFilterAndSearch(
    @Query() query: any,
    @Query("current") current: string,
    @Query("pageSize") pageSize: string,
  ) {
    return this.playlistsService.handleFilterAndSearchPlaylist(query, +current, +pageSize)
  }

  @Get("detail-playlist/:id")
  listPlaylistDetail(
    @Param("id") userId: string,
    @Query("current") current: number,
    @Query("pageSize") pageSize: number,
  ) {
    return this.playlistsService.handleGetDetailPlaylist(userId, +current, +pageSize);
  }


  @Get("list-playlist/:userId")
  listPlaylist(
    @Param("userId") userId: string,
    @Query("current") current: number,
    @Query("pageSize") pageSize: number,
  ) {
    return this.playlistsService.handleListPlaylist(userId, +current, +pageSize);
  }

  @Delete('delete-playlist/:id')
  @ResponseMessage('Deleted successfully')
  deletePlaylist(
    @Param('id') id: string,
    @Body() req: { userId: string }
  ) {
    return this.playlistsService.handleDeletePlaylist(id, req.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.playlistsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePlaylistDto: UpdatePlaylistDto) {
    return this.playlistsService.update(+id, updatePlaylistDto);
  }


}
