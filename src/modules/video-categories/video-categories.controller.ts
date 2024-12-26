import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { VideoCategoriesService } from './video-categories.service';
import { CreateVideoCategoryDto } from './dto/create-video-category.dto';
import { UpdateVideoCategoryDto } from './dto/update-video-category.dto';

@Controller('video-categories')
export class VideoCategoriesController {
  constructor(private readonly videoCategoriesService: VideoCategoriesService) {}

  @Post()
  create(@Body() createVideoCategoryDto: CreateVideoCategoryDto) {
    return this.videoCategoriesService.create(createVideoCategoryDto);
  }

  @Get()
  findAll() {
    return this.videoCategoriesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.videoCategoriesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateVideoCategoryDto: UpdateVideoCategoryDto) {
    return this.videoCategoriesService.update(+id, updateVideoCategoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.videoCategoriesService.remove(+id);
  }
}
