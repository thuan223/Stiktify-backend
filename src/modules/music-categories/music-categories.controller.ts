import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MusicCategoriesService } from './music-categories.service';
import { CreateMusicCategoryDto } from './dto/create-music-category.dto';
import { UpdateMusicCategoryDto } from './dto/update-music-category.dto';

@Controller('music-categories')
export class MusicCategoriesController {
  constructor(private readonly musicCategoriesService: MusicCategoriesService) {}

  @Post()
  create(@Body() createMusicCategoryDto: CreateMusicCategoryDto) {
    return this.musicCategoriesService.create(createMusicCategoryDto);
  }

  @Get()
  findAll() {
    return this.musicCategoriesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.musicCategoriesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMusicCategoryDto: UpdateMusicCategoryDto) {
    return this.musicCategoriesService.update(+id, updateMusicCategoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.musicCategoriesService.remove(+id);
  }
}
