import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MusicFavoriteService } from './music-favorite.service';
import { CreateMusicFavoriteDto } from './dto/create-music-favorite.dto';
import { UpdateMusicFavoriteDto } from './dto/update-music-favorite.dto';

@Controller('music-favorite')
export class MusicFavoriteController {
  constructor(private readonly musicFavoriteService: MusicFavoriteService) {}

  @Post()
  create(@Body() createMusicFavoriteDto: CreateMusicFavoriteDto) {
    return this.musicFavoriteService.create(createMusicFavoriteDto);
  }

  @Get()
  findAll() {
    return this.musicFavoriteService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.musicFavoriteService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMusicFavoriteDto: UpdateMusicFavoriteDto) {
    return this.musicFavoriteService.update(+id, updateMusicFavoriteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.musicFavoriteService.remove(+id);
  }
}
