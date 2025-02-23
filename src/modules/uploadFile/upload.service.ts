import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Video, VideoDocument } from '@/modules/uploadFile/schemas/upload-video.schema';
import { CreateVideoDto } from '@/modules/uploadFile/dto/upload-file.dto';

@Injectable()
export class UploadService {
  constructor(@InjectModel(Video.name) private videoModel: Model<VideoDocument>) {}

  async createPost(userId: string, createVideoDto: CreateVideoDto): Promise<Video> {
    const newVideo = new this.videoModel({
      ...createVideoDto,
      userId,
    });
    return newVideo.save();
  }
}
