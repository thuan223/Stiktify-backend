

import { Public } from '@/decorator/customize';
import { TrendingVideoDto } from './dto/trending-video.dto';
import { CreateWishListVideoDto } from './dto/create-wishlist-videos.dto';
import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ShortVideosService } from './short-videos.service';
import { CreateShortVideoDto } from './dto/create-short-video.dto';
import { UpdateShortVideoDto } from './dto/update-short-video.dto';
import { ResponseMessage } from '@/decorator/customize';
import { flagShortVideoDto } from './dto/flag-short-video.dto';

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
  findOne(@Body() req: flagShortVideoDto) {
    return this.shortVideosService.handleFlagVideo(req._id, req.flag);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateShortVideoDto: UpdateShortVideoDto,
  ) {
    return this.shortVideosService.update(+id, updateShortVideoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.shortVideosService.remove(+id);
  }

  @Post('trending-guest-videos')
  @Public()
  getTrendingVideosByGuest() {
    return this.shortVideosService.getTrendingVideosByGuest();
  }

  @Post('trending-user-videos')
  getTrendingVideosByUser(@Body() trendingVideoDto: TrendingVideoDto) {
    return this.shortVideosService.getTrendingVideosByUser(trendingVideoDto);
  }

  @Post('create-wishlist-videos')
  createWishListVideos(
    @Body() createWishlistVideosDto: CreateWishListVideoDto,
  ) {
    return this.shortVideosService.createWishListVideos(
      createWishlistVideosDto,
    );
  }
}
