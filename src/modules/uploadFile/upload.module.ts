import { Module } from '@nestjs/common';
import { UploadController } from '@/modules/uploadFile/upload.controller';
import { UploadService } from '@/modules/uploadFile/upload.service';
import { VideoSchema } from './schemas/upload-video.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { VideoReactionsModule } from '../video-reactions/video-reactions.module';

@Module({
    imports: [
      MongooseModule.forFeature([{ name: 'Video', schema: VideoSchema }]), 
      VideoReactionsModule,
    ],
    controllers: [UploadController],
    providers: [UploadService],
  })
  export class UploadModule {}