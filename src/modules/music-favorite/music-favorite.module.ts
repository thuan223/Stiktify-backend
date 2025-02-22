import { Module } from '@nestjs/common';
import { MusicFavoriteService } from './music-favorite.service';
import { MusicFavoriteController } from './music-favorite.controller';

@Module({
  controllers: [MusicFavoriteController],
  providers: [MusicFavoriteService],
})
export class MusicFavoriteModule {}
