import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { MusicFavoriteService } from './music-favorite.service';
import { CreateMusicFavoriteDto } from './dto/create-music-favorite.dto';
import { UpdateMusicFavoriteDto } from './dto/update-music-favorite.dto';
import { JwtAuthGuard } from '@/auth/passport/jwt-auth.guard';

@Controller('music-favorite')
export class MusicFavoriteController {
  constructor(private readonly musicFavoriteService: MusicFavoriteService) {}

  @Post('create-favorite')
  followUserByBody(@Body() body: { favoriteId: string; favoritingId: string }) {
    return this.musicFavoriteService.handleMusicFavorite(
      body.favoriteId,
      body.favoritingId,
    );
  }

  @Get('list-favorite-music/:userId')
  findAll(@Param('userId') userId: string) {
    return this.musicFavoriteService.findAll(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.musicFavoriteService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMusicFavoriteDto: UpdateMusicFavoriteDto,
  ) {
    return this.musicFavoriteService.update(+id, updateMusicFavoriteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.musicFavoriteService.remove(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('favorite/:musicId')
  async createComment(@Req() req: any, @Param('musicId') musicId: string) {
    const userId = req.user._id;
    return this.musicFavoriteService.handleMusicFavorite(userId, musicId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('check-favorite/:musicId')
  async checkFavorite(@Req() req: any, @Param('musicId') musicId: string) {
    const userId = req.user._id;
    return this.musicFavoriteService.checkFavorite(userId, musicId);
  }
}
