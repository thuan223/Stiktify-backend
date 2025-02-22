import { Module } from '@nestjs/common';
import { MusicFavoriteService } from './music-favorite.service';
import { MusicFavoriteController } from './music-favorite.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { MusicFavorite, MusicFavoriteSchema } from './schemas/music-favorite.schema';

@Module({
  imports: [
        MongooseModule.forFeature([{ name: MusicFavorite.name, schema: MusicFavoriteSchema}
        ])],
  controllers: [MusicFavoriteController],
  providers: [MusicFavoriteService],
})
export class MusicFavoriteModule {}
