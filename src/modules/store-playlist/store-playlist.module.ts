import { Module } from '@nestjs/common';
import { StorePlaylistService } from './store-playlist.service';
import { StorePlaylistController } from './store-playlist.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { StorePlaylist, StorePlaylistSchema } from './schemas/store-playlist.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: StorePlaylist.name, schema: StorePlaylistSchema }
    ])],
  controllers: [StorePlaylistController],
  providers: [StorePlaylistService],
  exports: [StorePlaylistService, MongooseModule]
})
export class StorePlaylistModule { }
