import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ShortVideosService } from './short-videos.service';
import { CreateShortVideoDto } from './dto/create-short-video.dto';
import { UpdateShortVideoDto } from './dto/update-short-video.dto';
import { Public } from '@/decorator/customize';
import { TrendingVideoDto } from './dto/trending-video.dto';
import { CreateWishListVideoDto } from './dto/create-wishlist-videos.dto';
@Controller('short-videos')
export class ShortVideosController {
  constructor(private readonly shortVideosService: ShortVideosService) {}

  @Post()
  create(@Body() createShortVideoDto: CreateShortVideoDto) {
    return this.shortVideosService.create(createShortVideoDto);
  }

  @Get()
  findAll() {
    return this.shortVideosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.shortVideosService.findOne(+id);
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

  @Post('trending-videos')
  @Public()
  getTrendingVideos(@Body() trendingVideoDto: TrendingVideoDto) {
    return this.shortVideosService.getTrendingVideos(trendingVideoDto);
  }

  @Post('create-wishlist-videos')
  @Public()
  createWishListVideos(
    @Body() createWishlistVideosDto: CreateWishListVideoDto,
  ) {
    return this.shortVideosService.createWishListVideos(
      createWishlistVideosDto,
    );
  }
}
