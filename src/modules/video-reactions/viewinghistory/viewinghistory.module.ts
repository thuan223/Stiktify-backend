import { Module } from '@nestjs/common';
import { ViewinghistoryService } from './viewinghistory.service';
import { ViewinghistoryController } from './viewinghistory.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ViewingHistory,
  ViewingHistorySchema,
} from './schemas/viewinghistory.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ViewingHistory.name, schema: ViewingHistorySchema },
    ]),
  ],
  controllers: [ViewinghistoryController],
  providers: [ViewinghistoryService],
  exports: [ViewinghistoryService],
})
export class ViewinghistoryModule {}
