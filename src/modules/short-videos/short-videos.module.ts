import { Module } from '@nestjs/common';
import { ShortVideosService } from './short-videos.service';
import { ShortVideosController } from './short-videos.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Video, VideoSchema } from './schemas/short-video.schema';
import { WishlistModule } from '../wishlist/wishlist.module';
import { VideoCategoriesModule } from '../video-categories/video-categories.module';

@Module({
  imports: [
    WishlistModule,
    VideoCategoriesModule,
    MongooseModule.forFeature([{ name: Video.name, schema: VideoSchema }]),
  ],
  controllers: [ShortVideosController],
  providers: [ShortVideosService],
  exports: [ShortVideosService],
})
export class ShortVideosModule { }
