

import { Public } from '@/decorator/customize';
import { TrendingVideoDto } from './dto/trending-video.dto';
import { CreateWishListVideoDto } from './dto/create-wishlist-videos.dto';
import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Request } from '@nestjs/common';
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
  @ResponseMessage('Updated successfully')
  findOne(@Body() req: flagShortVideoDto) {
    return this.shortVideosService.handleFlagVideo(req._id, req.flag);
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


  @Get('my-videos')
  getUserVideos(
    @Request() req,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ) {
    return this.shortVideosService.ViewVideoPosted(req.user._id, +current, +pageSize);
  }

  @Get('search-video')
  searchVideoByDescription(
    @Query('searchText') searchText: string,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ) {
    return this.shortVideosService.searchVideosByDescription(searchText, +current || 1, +pageSize || 10);
  }

  @Get('filter-by-category')
  async filterByCategory(
    @Query('category') category: string,
    @Query('current') current?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.shortVideosService.findByCategory(category, +current || 1, +pageSize || 10);
  }

  @Get("filter-searchCategory")
  findAllUserByFilterAndSearch(
    @Query() query: string,
    @Query("current") current: string,
    @Query("pageSize") pageSize: string,
  ) {
    return this.shortVideosService.handleFilterSearchVideo(query, +current, +pageSize)
  }

// Upload a new video
@Post('upload')
async uploadVideo(@Body() createShortVideoDto: CreateShortVideoDto) {
  return this.shortVideosService.create(createShortVideoDto);
}

// Update video
@Patch(':id')
async update(@Param('id') id: string, @Body() updateShortVideoDto: UpdateShortVideoDto) {
  return this.shortVideosService.update(id, updateShortVideoDto);
}
// Delete Short Video cho trạng thái isDeleted thành True  
@Delete(':id')
async deleteVideo(@Param('id') id: string, @Body('userId') userId: string) {
  return this.shortVideosService.remove(id, userId);
}
// Share Short Video 
@Get('share/:id')
async shareVideo(@Param('id') id: string) {
  return this.shortVideosService.shareVideo(id);
}

// // Report video
// @Post(':id/report')
// async reportVideo(
//   @Param('id') id: string,
//   @Body('reason') reason: string,
//   @Body('userId') userId: string,
// ) {
//   return this.shortVideosService.reportVideo(id, reason, userId);
// }
// // Like or Unlike a video
// @Patch(':id/like')
// async likeVideo(@Param('id') videoId: string, @Body('userId') userId: string) {
//   return this.shortVideosService.likeVideo(videoId, userId);
// }

}


