import { Module } from '@nestjs/common';
import { ListeninghistoryService } from './listeninghistory.service';
import { ListeninghistoryController } from './listeninghistory.controller';
import { ListeningHistory, ListeningHistorySchema } from './schemas/listeninghistory.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
    imports: [
      MongooseModule.forFeature([
        { name: ListeningHistory.name, schema: ListeningHistorySchema},
      ]),
    ],
  controllers: [ListeninghistoryController],
  providers: [ListeninghistoryService],
  exports: [ListeninghistoryService]
})
export class ListeninghistoryModule {}
