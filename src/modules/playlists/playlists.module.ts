import { forwardRef, Module } from '@nestjs/common';
import { PlaylistsService } from './playlists.service';
import { PlaylistsController } from './playlists.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Playlist, PlaylistSchema } from './schemas/playlist.schema';
import { MusicsModule } from '../musics/musics.module';
import { UsersModule } from '../users/users.module';
import { Category, CategorySchema } from '../categories/schemas/category.schema';
import { MusicCategory, MusicCategorySchema } from '../music-categories/schemas/music-category.schema';
import { StorePlaylistModule } from '../store-playlist/store-playlist.module';


@Module({
  imports: [
    forwardRef(() => StorePlaylistModule),
    MusicsModule,
    UsersModule,
    MongooseModule.forFeature([{ name: Playlist.name, schema: PlaylistSchema }]),
    MongooseModule.forFeature([{ name: Category.name, schema: CategorySchema }]),
    MongooseModule.forFeature([{ name: MusicCategory.name, schema: MusicCategorySchema }])
  ],
  controllers: [PlaylistsController],
  providers: [PlaylistsService],
  exports: [PlaylistsService, MongooseModule],
})
export class PlaylistsModule { }
