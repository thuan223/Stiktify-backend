import { forwardRef, Module } from '@nestjs/common';
import { ShortVideosService } from './short-videos.service';
import { ShortVideosController } from './short-videos.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Video, VideoSchema } from './schemas/short-video.schema';
import { WishlistModule } from '../wishlist/wishlist.module';
import { VideoCategoriesModule } from '../video-categories/video-categories.module';
import { CategoriesModule } from '../categories/categories.module';
import { UsersModule } from '../users/users.module';
import { ReportModule } from '../report/report.module';
import {
  Category,
  CategorySchema,
} from '../categories/schemas/category.schema';
import {
  VideoCategory,
  VideoCategorySchema,
} from '../video-categories/schemas/video-category.schema';
import { SettingsModule } from '../settings/settings.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule.register({
      httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false }),
    }),
    forwardRef(() => WishlistModule),
    SettingsModule,
    VideoCategoriesModule,
    MongooseModule.forFeature([{ name: Video.name, schema: VideoSchema }]),
    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
    ]),
    // Đăng ký VideoCategoryModel
    MongooseModule.forFeature([
      { name: VideoCategory.name, schema: VideoCategorySchema },
    ]),
    CategoriesModule,
    UsersModule,
    forwardRef(() => ReportModule),
  ],
  controllers: [ShortVideosController],
  providers: [ShortVideosService],
  exports: [ShortVideosService, MongooseModule],
})
export class ShortVideosModule {}
