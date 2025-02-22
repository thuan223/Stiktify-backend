import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { MusicsService } from './musics.service';
import { CreateMusicDto } from './dto/create-music.dto';
import { UpdateMusicDto } from './dto/update-music.dto';

@Controller('musics')
export class MusicsController {
  constructor(private readonly musicsService: MusicsService) { }

  @Post()
  create(@Body() createMusicDto: CreateMusicDto) {
    return this.musicsService.create(createMusicDto);
  }

  @Get("filter-search")
  findMusicFilterAndSearch(
    @Query() query: any,
    @Query("current") current: string,
    @Query("pageSize") pageSize: string,
  ) {
    return this.musicsService.handleFilterAndSearchMusic(query, +current, +pageSize)
  }

  @Get("list-hot-music")
  listHotMusic(
    @Query("current") current: string,
    @Query("pageSize") pageSize: string,
  ) {
    return this.musicsService.handleListHotMusic(+current, +pageSize);
  }

  @Get('/display-music/:id')
  displayMusic(
    @Param("id") id: string
  ) {
    return this.musicsService.handleDisplayMusic(id);
  }

  @Get('/list-music')
  listMusic(
    @Query("current") current: string,
    @Query("pageSize") pageSize: string,
  ) {
    return this.musicsService.handleListMusic(+current, +pageSize);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMusicDto: UpdateMusicDto) {
    return this.musicsService.update(+id, updateMusicDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.musicsService.remove(+id);
  }

}