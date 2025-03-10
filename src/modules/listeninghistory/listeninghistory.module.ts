import { Module } from '@nestjs/common';
import { ListeninghistoryService } from './listeninghistory.service';
import { ListeninghistoryController } from './listeninghistory.controller';
import { ListeningHistory, ListeningHistorySchema } from './schemas/listeninghistory.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { Music, MusicSchema } from '../musics/schemas/music.schema';

@Module({
    imports: [
      MongooseModule.forFeature([
        { name: ListeningHistory.name, schema: ListeningHistorySchema},
        { name: Music.name, schema: MusicSchema},
      ]),
    ],
  controllers: [ListeninghistoryController],
  providers: [ListeninghistoryService],
  exports: [ListeninghistoryService]
})
export class ListeninghistoryModule {}
