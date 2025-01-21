import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ShortVideosService } from './short-videos.service';
import { CreateShortVideoDto } from './dto/create-short-video.dto';
import { UpdateShortVideoDto } from './dto/update-short-video.dto';

@Controller('short-videos')
export class ShortVideosController {
  constructor(private readonly shortVideosService: ShortVideosService) { }

  @Post()
  create(@Body() createShortVideoDto: CreateShortVideoDto) {
    return this.shortVideosService.create(createShortVideoDto);
  }

  @Get('list-video')
  findAll(
    @Query() query: string,
    @Query("current") current: string,
    @Query("pageSize") pageSize: string,
  ) {
    return this.shortVideosService.findAll(query, +current, +pageSize);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.shortVideosService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateShortVideoDto: UpdateShortVideoDto) {
    return this.shortVideosService.update(+id, updateShortVideoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.shortVideosService.remove(+id);
  }
}
