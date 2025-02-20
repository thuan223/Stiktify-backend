import { Injectable } from '@nestjs/common';
import {
  CreateCommentReactionDto,
  GetReaction,
} from './dto/create-comment-reaction.dto';
import { InjectModel } from '@nestjs/mongoose';
import { CommentReaction } from './schema/comment-reaction.schema';
import { Model } from 'mongoose';
import { Comment } from '../comments/schema/comment.schema';
import { DeleteCommentReactionDto } from './dto/delete-comment-reaction.dto';

@Injectable()
export class CommentReactionsService {
  constructor(
    @InjectModel(CommentReaction.name)
    private readonly videoReactionModel: Model<CommentReaction>,
    @InjectModel(Comment.name) private CommentModal: Model<Comment>,
  ) {}

  async getUserReaction(userId: string, dto: GetReaction) {
    return this.videoReactionModel
      .findOne({ userId, commentId: dto.commentId })
      .select('reactionTypeId');
  }

  async reactToComment(userId: string, dto: CreateCommentReactionDto) {
    const existingReaction = await this.videoReactionModel.findOne({
      commentId: dto.commentId,
      userId,
    });

    if (existingReaction) {
      existingReaction.reactionTypeId = dto.reactionTypeId;
      return existingReaction.save();
    } else {
      const newReaction = new this.videoReactionModel({
        ...dto,
        userId,
      });
      await this.CommentModal.findByIdAndUpdate(dto.commentId, {
        $inc: { totalReaction: 1 },
      });

      return newReaction.save();
    }
  }

  async unreactToComment(userId: string, dto: DeleteCommentReactionDto) {
    console.log(dto);

    const reaction = await this.videoReactionModel.findOneAndDelete({
      commentId: dto.commentId,
      userId,
    });

    if (reaction) {
      await this.CommentModal.findByIdAndUpdate(dto.commentId, {
        $inc: { totalReaction: -1 },
      });
    }

    return { message: 'Reaction removed successfully' };
  }
}
