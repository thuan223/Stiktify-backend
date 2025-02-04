import { Injectable } from '@nestjs/common';
import { Comment } from './schema/comment.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
  ) {}
  async getCommentsByVideoId(videoId: number): Promise<Comment[]> {
    return await this.commentModel.find({ videoId, parentId: null });
  }

  async createComment(
    userId: string,
    createCommentDto: CreateCommentDto,
  ): Promise<Comment> {
    const newComment = new this.commentModel({
      ...createCommentDto,
      userId,
    });
    return await newComment.save();
  }
}
