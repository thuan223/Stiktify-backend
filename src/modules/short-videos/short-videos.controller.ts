import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Request } from '@nestjs/common';
import { ShortVideosService } from './short-videos.service';
import { CreateShortVideoDto } from './dto/create-short-video.dto';
import { UpdateShortVideoDto } from './dto/update-short-video.dto';
import { ResponseMessage } from '@/decorator/customize';

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

  @Post('flag-video')
  @ResponseMessage('Update status successfully')
  findOne(@Body() req: { flag: boolean, _id: string }) {
    return this.shortVideosService.handleFlagVideo(req);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateShortVideoDto: UpdateShortVideoDto) {
    return this.shortVideosService.update(+id, updateShortVideoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.shortVideosService.remove(+id);
  }

  @Get('my-videos')
  @ResponseMessage('Fetch user videos successfully')
  getMyVideos(
    @Request() req, 
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ) {
    const userId = req.user._id; // userId được gắn từ token sau khi login
    return this.shortVideosService.findUserVideos(userId, +current || 1, +pageSize || 10);
  }
}
