import { Module } from '@nestjs/common';
import { PlaylistsService } from './playlists.service';
import { PlaylistsController } from './playlists.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Playlist, PlaylistSchema } from './schemas/playlist.schema';
import { MusicsModule } from '../musics/musics.module';
import { UsersModule } from '../users/users.module';


@Module({
  imports: [
    MusicsModule,
    UsersModule,
    MongooseModule.forFeature([{ name: Playlist.name, schema: PlaylistSchema }]),
  ],
  controllers: [PlaylistsController],
  providers: [PlaylistsService],
  exports: [PlaylistsService, MongooseModule],
})
export class PlaylistsModule { }
