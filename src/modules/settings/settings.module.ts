import { forwardRef, Module } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { SettingsController } from './settings.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Setting, SettingSchema } from './schemas/schema.entity';
import { WishlistScoreModule } from '../wishlist-score/wishlist-score.module';
import { WishlistModule } from '../wishlist/wishlist.module';

@Module({
  imports: [
    forwardRef(() => WishlistScoreModule),
    forwardRef(() => WishlistModule),
    MongooseModule.forFeature([{ name: Setting.name, schema: SettingSchema }]),
  ],
  controllers: [SettingsController],
  providers: [SettingsService],
  exports: [SettingsService, MongooseModule],
})
export class SettingsModule {}
