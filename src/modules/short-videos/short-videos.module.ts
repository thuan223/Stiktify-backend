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
import { FriendRequestModule } from '../friend-request/friend-request.module';
import { NotificationsModule } from '../notifications/notifications.module';
import {
  Notification,
  NotificationSchema,
} from '../notifications/schema/notification.schema';

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
    MongooseModule.forFeature([
      { name: VideoCategory.name, schema: VideoCategorySchema },
    ]),
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
    ]),
    CategoriesModule,
    UsersModule,
    FriendRequestModule,
    NotificationsModule,
    forwardRef(() => ReportModule),
  ],
  controllers: [ShortVideosController],
  providers: [ShortVideosService],
  exports: [ShortVideosService, MongooseModule],
})
export class ShortVideosModule {}
