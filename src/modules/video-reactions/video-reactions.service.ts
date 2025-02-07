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

@Injectable()
export class VideoReactionsService {
  constructor(
    @InjectModel(VideoReaction.name)
    private readonly videoReactionModel: Model<VideoReactionDocument>,
    @InjectModel(Video.name) private VideoModal: Model<Video>,
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
    console.log(dto);

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
}
