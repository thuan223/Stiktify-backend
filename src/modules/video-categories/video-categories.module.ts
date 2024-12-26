import { Module } from '@nestjs/common';
import { VideoCategoriesService } from './video-categories.service';
import { VideoCategoriesController } from './video-categories.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  VideoCategory,
  VideoCategorySchema,
} from './schemas/video-category.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: VideoCategory.name, schema: VideoCategorySchema },
    ]),
  ],
  controllers: [VideoCategoriesController],
  providers: [VideoCategoriesService],
  exports: [VideoCategoriesService],
})
export class VideoCategoriesModule {}
