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
    private readonly commentReactionModel: Model<CommentReaction>,
    @InjectModel(Comment.name) private CommentModal: Model<Comment>,
  ) {}

  async getUserReaction(userId: string, dto: GetReaction) {
    return this.commentReactionModel
      .findOne({ userId, commentId: dto.commentId })
      .select('reactionTypeId');
  }

  async reactToComment(userId: string, dto: CreateCommentReactionDto) {
    const existingReaction = await this.commentReactionModel.findOne({
      commentId: dto.commentId,
      userId,
    });

    if (existingReaction) {
      existingReaction.reactionTypeId = dto.reactionTypeId;
      return existingReaction.save();
    } else {
      const newReaction = new this.commentReactionModel({
        ...dto,
        userId,
      });
      await this.CommentModal.findByIdAndUpdate(dto.commentId, {
        $inc: { totalReactions: 1 },
      });

      return newReaction.save();
    }
  }

  async unreactToComment(userId: string, dto: DeleteCommentReactionDto) {
    console.log(dto);

    const reaction = await this.commentReactionModel.findOneAndDelete({
      commentId: dto.commentId,
      userId,
    });

    if (reaction) {
      await this.CommentModal.findByIdAndUpdate(dto.commentId, {
        $inc: { totalReactions: -1 },
      });
    }

    return { message: 'Reaction removed successfully' };
  }
}
