import { Module } from '@nestjs/common';
import { VideoReactionsService } from './video-reactions.service';
import { VideoReactionsController } from './video-reactions.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  VideoReaction,
  VideoReactionSchema,
} from './schemas/video-reaction.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: VideoReaction.name, schema: VideoReactionSchema },
    ]),
  ],
  controllers: [VideoReactionsController],
  providers: [VideoReactionsService],
  exports: [VideoReactionsService],
})
export class VideoReactionsModule {}
