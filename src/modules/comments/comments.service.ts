import { Injectable } from '@nestjs/common';
import { Comment } from './schema/comment.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateCommentDto } from './dto/create-comment.dto';
import { User } from '../users/schemas/user.schema';
import { Video } from '../short-videos/schemas/short-video.schema';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
    @InjectModel(Video.name) private VideoModal: Model<Video>,
  ) {}
  async getCommentsByVideoId(videoId: Types.ObjectId): Promise<any[]> {
    const thisVideoComments = await this.commentModel
      .find({ videoId })
      .populate('userId', 'fullname')
      .exec();

    return thisVideoComments.map((comment) => ({
      _id: comment._id,
      username:
        comment.userId && 'fullname' in comment.userId
          ? comment.userId.fullname
          : 'Unknown',
      videoId: comment.videoId,
      parentId: comment.parentId,
      CommentDescription: comment.CommentDescription,
    }));
  }
  async createComment(
    userId: string,
    createCommentDto: CreateCommentDto,
  ): Promise<Comment> {
    const newComment = new this.commentModel({
      ...createCommentDto,
      userId,
    });
    await this.VideoModal.findByIdAndUpdate(createCommentDto.videoId, {
      $inc: { totalComment: 1 },
    });
    return await newComment.save();
  }
}
