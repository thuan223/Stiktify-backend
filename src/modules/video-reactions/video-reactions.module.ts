import { Module } from '@nestjs/common';
import { VideoReactionsService } from './video-reactions.service';
import { VideoReactionsController } from './video-reactions.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  VideoReaction,
  VideoReactionSchema,
} from './schemas/video-reaction.schema';
import { ShortVideosModule } from '../short-videos/short-videos.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: VideoReaction.name, schema: VideoReactionSchema },
    ]),
    ShortVideosModule,
    NotificationsModule,
  ],
  controllers: [VideoReactionsController],
  providers: [VideoReactionsService],
  exports: [VideoReactionsService],
})
export class VideoReactionsModule {}
