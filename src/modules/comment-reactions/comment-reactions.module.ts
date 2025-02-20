import { Module } from '@nestjs/common';
import { CommentReactionsService } from './comment-reactions.service';
import { CommentReactionsController } from './comment-reactions.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  CommentReaction,
  CommentReactionSchema,
} from './schema/comment-reaction.schema';
import { CommentsModule } from '../comments/comments.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CommentReaction.name, schema: CommentReactionSchema },
    ]),
    CommentsModule,
  ],
  controllers: [CommentReactionsController],
  providers: [CommentReactionsService],
  exports: [CommentReactionsService],
})
export class CommentReactionsModule {}
