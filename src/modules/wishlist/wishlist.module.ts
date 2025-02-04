import { Module } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { WishlistController } from './wishlist.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { WishList, WishListSchema } from './schemas/wishlist.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WishList.name, schema: WishListSchema },
    ]),
  ],
  controllers: [WishlistController],
  providers: [WishlistService],
  exports: [WishlistService],
})
export class WishlistModule {}
