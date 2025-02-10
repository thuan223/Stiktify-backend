import { forwardRef, Module } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { WishlistController } from './wishlist.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { WishList, WishListSchema } from './schemas/wishlist.entity';
import { WishlistScoreModule } from '../wishlist-score/wishlist-score.module';


@Module({
  imports: [
   forwardRef(() => WishlistScoreModule),
    MongooseModule.forFeature([
      { name: WishList.name, schema: WishListSchema },
    ]),
  ],
  controllers: [WishlistController],
  providers: [WishlistService],
  exports: [WishlistService],
})
export class WishlistModule {}
  