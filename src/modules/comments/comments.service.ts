import { Injectable, Res } from '@nestjs/common';
import { Comment } from './schema/comment.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  CreateCommentDto,
  CreateMusicCommentDto,
} from './dto/create-comment.dto';
import { User } from '../users/schemas/user.schema';
import { Video } from '../short-videos/schemas/short-video.schema';
import { Music } from '../musics/schemas/music.schema';
import { Request, Response, NextFunction } from 'express';
import { uploadFile } from '@/helpers/uploadFileHelper';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
    @InjectModel(Video.name) private VideoModal: Model<Video>,
    @InjectModel(Music.name) private MusicModal: Model<Music>,
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

  async getChildComments(parentId: Types.ObjectId): Promise<any[]> {
    console.log(parentId);

    const childComments = await this.commentModel
      .find({ parentId })
      .populate('userId', 'fullname')
      .exec();
    console.log(childComments);

    return childComments.map((comment) => ({
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

  async replyToComment(
    userId: string,
    parentId: Types.ObjectId,
    createCommentDto: CreateCommentDto,
  ): Promise<Comment> {
    const newReply = new this.commentModel({
      ...createCommentDto,
      userId,
      parentId,
    });

    await this.VideoModal.findByIdAndUpdate(createCommentDto.videoId, {
      $inc: { totalComment: 1 },
    });

    return await newReply.save();
  }

  async getCommentsByMusicId(musicId: Types.ObjectId): Promise<any[]> {
    const thisMusicComments = await this.commentModel
      .find({ musicId })
      .populate('userId', 'fullname')
      .exec();

    return thisMusicComments.map((comment) => ({
      _id: comment._id,
      username:
        comment.userId && 'fullname' in comment.userId
          ? comment.userId.fullname
          : 'Unknown',
      musicId: comment.musicId,
      parentId: comment.parentId,
      CommentDescription: comment.CommentDescription,
    }));
  }
  async createMusicComment(
    userId: string,
    createCommentDto: CreateMusicCommentDto,
  ): Promise<Comment> {
    const newComment = new this.commentModel({
      ...createCommentDto,
      userId,
    });
    await this.MusicModal.findByIdAndUpdate(createCommentDto.musicId, {
      $inc: { totalComment: 1 },
    });
    return await newComment.save();
  }

  // async getChildMusiComments(parentId: Types.ObjectId): Promise<any[]> {
  //   console.log(parentId);

  //   const childComments = await this.commentModel
  //     .find({ parentId })
  //     .populate('userId', 'fullname')
  //     .exec();
  //   console.log(childComments);

  //   return childComments.map((comment) => ({
  //     _id: comment._id,
  //     username:
  //       comment.userId && 'fullname' in comment.userId
  //         ? comment.userId.fullname
  //         : 'Unknown',
  //     videoId: comment.videoId,
  //     parentId: comment.parentId,
  //     CommentDescription: comment.CommentDescription,
  //   }));
  // }
}
