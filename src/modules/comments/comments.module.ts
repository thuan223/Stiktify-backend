import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Comment, CommentSchema } from './schema/comment.schema';
import { ShortVideosModule } from '../short-videos/short-videos.module';
import { MusicsModule } from '../musics/musics.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
    ShortVideosModule,
    MusicsModule,
    NotificationsModule,
  ],

  controllers: [CommentsController],
  providers: [CommentsService],
  exports: [CommentsService, MongooseModule],
})
export class CommentsModule {}
