import { Injectable } from '@nestjs/common';
import {
  CreateVideoReactionDto,
  GetReaction,
} from './dto/create-video-reaction.dto';
import { InjectModel } from '@nestjs/mongoose';
import {
  VideoReaction,
  VideoReactionDocument,
} from './schemas/video-reaction.schema';
import { Model, Types } from 'mongoose';
import { Video } from '../short-videos/schemas/short-video.schema';
import { DeleteVideoReactionDto } from './dto/delete-video-reaction.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';

@Injectable()
export class VideoReactionsService {
  constructor(
    @InjectModel(VideoReaction.name)
    private readonly videoReactionModel: Model<VideoReactionDocument>,
    @InjectModel(Video.name) private VideoModal: Model<Video>,
    private notificationsService: NotificationsService,
    private notificationsGateway: NotificationsGateway,
  ) {}

  async getUserReaction(userId: string, dto: GetReaction) {
    return this.videoReactionModel
      .findOne({ userId, videoId: dto.videoId })
      .select('reactionTypeId');
  }

  async reactToVideo(userId: string, dto: CreateVideoReactionDto) {
    const existingReaction = await this.videoReactionModel.findOne({
      videoId: dto.videoId,
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
      await this.VideoModal.findByIdAndUpdate(dto.videoId, {
        $inc: { totalReaction: 1 },
      });
      const video: any = await this.VideoModal.findById(dto.videoId).populate(
        'userId',
        '_id',
      );

      if (!video) {
        throw new Error('Video not exist');
      }

      const existingNotification =
        await this.notificationsService.findNotification({
          sender: userId,
          recipient: video.userId._id.toString(),
          type: 'new-react',
          postId: video._id,
        });

      if (existingNotification) return newReaction.save();

      const notification = await this.notificationsService.createNotification({
        sender: userId,
        recipient: video.userId._id.toString(),
        type: 'new-react',
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

      return newReaction.save();
    }
  }

  async unreactToVideo(userId: string, dto: DeleteVideoReactionDto) {
    const reaction = await this.videoReactionModel.findOneAndDelete({
      videoId: dto.videoId,
      userId,
    });

    if (reaction) {
      await this.VideoModal.findByIdAndUpdate(dto.videoId, {
        $inc: { totalReaction: -1 },
      });
    }

    return { message: 'Reaction removed successfully' };
  }

  async getVideoReactions(videoId: string) {
    return this.videoReactionModel.distinct('reactionTypeId', { videoId });
  }
  // ThangLH
  async getReactionsByUserId(userId: string) {
    const reactions = await this.videoReactionModel
      .find({ userId })
      .populate({
        path: 'reactionTypeId',
        select: 'reactionTypeName',
      })
      .select('_id videoId reactionTypeId');

    return reactions.filter((r) => {
      const reactionType = r.reactionTypeId as unknown as {
        reactionTypeName?: string;
      };
      return reactionType?.reactionTypeName === 'Like';
    });
  }
}
