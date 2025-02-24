import { Module } from '@nestjs/common';
import { MusicFavoriteService } from './music-favorite.service';
import { MusicFavoriteController } from './music-favorite.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { MusicFavorite, MusicFavoriteSchema } from './schema/music-favorite.schema';
import { Music, MusicSchema } from '../musics/schemas/music.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MusicFavorite.name, schema: MusicFavoriteSchema },  
      { name: Music.name, schema: MusicSchema },
    ]),
  ],
  controllers: [MusicFavoriteController],
  providers: [MusicFavoriteService],
})
export class MusicFavoriteModule {}
