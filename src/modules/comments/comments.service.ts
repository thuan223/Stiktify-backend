import { Injectable, Res } from '@nestjs/common';
import { Comment } from './schema/comment.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  CreateCommentDto,
  CreateMusicCommentDto,
  ReplyCommentDto,
} from './dto/create-comment.dto';
import { User } from '../users/schemas/user.schema';
import { Video } from '../short-videos/schemas/short-video.schema';
import { Music } from '../musics/schemas/music.schema';
import { Request, Response, NextFunction } from 'express';
import { uploadFile } from '@/helpers/uploadFileHelper';
import { DeleteCommentDto, UpdateCommentDto } from './dto/update-comment.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
    @InjectModel(Video.name) private VideoModal: Model<Video>,
    @InjectModel(Music.name) private MusicModal: Model<Music>,
    private notificationsService: NotificationsService,
    private notificationsGateway: NotificationsGateway,
  ) {}
  async getCommentsByVideoId(videoId: Types.ObjectId): Promise<any[]> {
    const thisVideoComments = await this.commentModel
      .find({ videoId, parentId: null })
      .populate('userId', 'fullname image')
      .exec();

    return thisVideoComments.map((comment) => ({
      _id: comment._id,
      username:
        comment.userId && 'fullname' in comment.userId
          ? comment.userId.fullname
          : 'Unknown',
      userImage:
        comment.userId && 'fullname' in comment.userId
          ? comment.userId.image
          : 'https://firebasestorage.googleapis.com/v0/b/stiktify-bachend.firebasestorage.app/o/avatars%2Fdefault_avatar.png?alt=media&token=93109c9b-d284-41ea-95e7-4786e3c69328',
      videoId: comment.videoId,
      parentId: comment.parentId,
      CommentDescription: comment.CommentDescription,
      totalOfChildComments: comment.totalOfChildComments,
      totalReactions: comment.totalReactions,
      user: comment.userId,
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
    const video: any = await this.VideoModal.findById(
      createCommentDto.videoId,
    ).populate('userId', '_id');

    if (!video) {
      throw new Error('Video not exist');
    }

    const notification = await this.notificationsService.createNotification({
      sender: userId,
      recipient: video.userId._id.toString(),
      type: 'new-comment',
      postId: video._id,
    });

    // Lấy dữ liệu thông báo đầy đủ
    const populatedNotification =
      await this.notificationsService.populateNotification(notification._id);
    console.log(populatedNotification);

    // Gửi thông báo realtime qua WebSocket
    this.notificationsGateway.sendNotification(
      userId,
      populatedNotification.recipient,
      populatedNotification,
    );

    return await newComment.save();
  }

  async getChildComments(parentId: Types.ObjectId): Promise<any[]> {
    const childComments = await this.commentModel
      .find({ parentId })
      .populate('userId', 'fullname image')
      .exec();

    return childComments.map((comment) => ({
      _id: comment._id,
      username:
        comment.userId && 'fullname' in comment.userId
          ? comment.userId.fullname
          : 'Unknown',
      userImage:
        comment.userId && 'image' in comment.userId
          ? comment.userId.image
          : 'https://firebasestorage.googleapis.com/v0/b/stiktify-bachend.firebasestorage.app/o/avatars%2Fdefault_avatar.png?alt=media&token=93109c9b-d284-41ea-95e7-4786e3c69328',
      videoId: comment.videoId,
      parentId: comment.parentId,
      CommentDescription: comment.CommentDescription,
    }));
  }

  async replyToComment(
    userId: string,
    createCommentDto: ReplyCommentDto,
  ): Promise<Comment> {
    const newReply = new this.commentModel({
      ...createCommentDto,
      userId,
    });

    await this.VideoModal.findByIdAndUpdate(createCommentDto.videoId, {
      $inc: { totalComment: 1 },
    });

    await this.commentModel.findByIdAndUpdate(createCommentDto.parentId, {
      $inc: { totalOfChildComments: 1 },
    });

    return await newReply.save();
  }

  async updateComment(userId: string, updateCommentDto: UpdateCommentDto) {
    const { commentId, CommentDescription } = updateCommentDto;

    const comment = await this.commentModel.findById(commentId);
    if (!comment) {
      throw new Error('Comment not found');
    }
    if (comment.userId.toString() !== userId) {
      throw new Error('You are not authorized to update this comment');
    }

    comment.CommentDescription = CommentDescription;
    return await comment.save();
  }

  async deleteComment(userId: string, deleteCommentDto: DeleteCommentDto) {
    const { commentId } = deleteCommentDto;

    const comment = await this.commentModel.findById(commentId);
    if (!comment) {
      throw new Error('Comment not found');
    }
    if (comment.userId.toString() !== userId) {
      throw new Error('You are not authorized to delete this comment');
    }

    await this.commentModel.findByIdAndDelete(commentId);

    if (!comment.parentId) {
      await this.VideoModal.findByIdAndUpdate(comment.videoId, {
        $inc: { totalComment: -1 },
      });
    } else {
      await this.commentModel.findByIdAndUpdate(comment.parentId, {
        $inc: { totalOfChildComments: -1 },
      });
    }

    return { message: 'Comment deleted successfully' };
  }

  async getCommentsByMusicId(musicId: Types.ObjectId): Promise<any[]> {
    const thisMusicComments = await this.commentModel
      .find({ musicId })
      .populate('userId', 'fullname image')
      .exec();

    return thisMusicComments.map((comment) => ({
      _id: comment._id,
      userId: comment.userId,
      username:
        comment.userId && 'fullname' in comment.userId
          ? comment.userId.fullname
          : 'Unknown',
      userImage:
        comment.userId && 'image' in comment.userId
          ? comment.userId.image
          : 'https://firebasestorage.googleapis.com/v0/b/stiktify-bachend.firebasestorage.app/o/avatars%2Fdefault_avatar.png?alt=media&token=93109c9b-d284-41ea-95e7-4786e3c69328',
      musicId: comment.musicId,
      parentId: comment.parentId,
      totalReactions: comment.totalReactions,
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

    const music: any = await this.MusicModal.findById(
      createCommentDto.musicId,
    ).populate('userId', '_id');

    if (!music) {
      throw new Error('Music not exist');
    }

    const notification = await this.notificationsService.createNotification({
      sender: userId,
      recipient: music.userId._id.toString(),
      type: 'new-music-comment',
      musicId: music._id,
    });

    // Lấy dữ liệu thông báo đầy đủ
    const populatedNotification =
      await this.notificationsService.populateNotification(notification._id);
    console.log(populatedNotification);

    // Gửi thông báo realtime qua WebSocket
    this.notificationsGateway.sendNotification(
      userId,
      populatedNotification.recipient,
      populatedNotification,
    );
    return await newComment.save();
  }
  async updateMusicComment(userId: string, updateCommentDto: UpdateCommentDto) {
    const { commentId, CommentDescription } = updateCommentDto;

    const comment = await this.commentModel.findById(commentId);
    if (!comment) {
      throw new Error('Comment not found');
    }
    if (comment.userId.toString() !== userId) {
      throw new Error('You are not authorized to update this comment');
    }

    comment.CommentDescription = CommentDescription;
    return await comment.save();
  }

  async deleteMusicComment(userId: string, deleteCommentDto: DeleteCommentDto) {
    const { commentId } = deleteCommentDto;

    const comment = await this.commentModel.findById(commentId);
    if (!comment) {
      throw new Error('Comment not found');
    }
    if (comment.userId.toString() !== userId) {
      throw new Error('You are not authorized to delete this comment');
    }

    await this.commentModel.findByIdAndDelete(commentId);

    if (!comment.parentId) {
      await this.MusicModal.findByIdAndUpdate(comment.musicId, {
        $inc: { totalComment: -1 },
      });
    } else {
      await this.commentModel.findByIdAndUpdate(comment.parentId, {
        $inc: { totalOfChildComments: -1 },
      });
    }

    return { message: 'Comment deleted successfully' };
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
