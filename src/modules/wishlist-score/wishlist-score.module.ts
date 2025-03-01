import { forwardRef, Module } from '@nestjs/common';
import { WishlistScoreService } from './wishlist-score.service';
import { WishlistScoreController } from './wishlist-score.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  WishlistScore,
  WishlistScoreSchema,
} from './schemas/wishlist-score.entity';
import { ShortVideosModule } from '../short-videos/short-videos.module';
import { VideoCategoriesModule } from '../video-categories/video-categories.module';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [
   forwardRef(() => ShortVideosModule),
   forwardRef(() => SettingsModule),
    VideoCategoriesModule,
    MongooseModule.forFeature([
      { name: WishlistScore.name, schema: WishlistScoreSchema },
    ]),
  ],
  controllers: [WishlistScoreController],
  providers: [WishlistScoreService],
  exports: [WishlistScoreService],
})
export class WishlistScoreModule {}
