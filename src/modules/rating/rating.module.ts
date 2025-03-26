// src/rating/rating.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RatingController } from './rating.controller';
import { RatingService } from './rating.service';
import { Rating, RatingSchema } from './schema/rating.schema';
import { Order, OrderSchema } from '../order/schemas/order.schema';
import { Product, ProductSchema } from '../products/schemas/product.schema';
import { AuthModule } from '@/auth/auth.module';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: Rating.name, schema: RatingSchema },
      { name: Order.name, schema: OrderSchema },
      { name: Product.name, schema: ProductSchema }
    ])
  ],
  controllers: [RatingController],
  providers: [RatingService],
})
export class RatingModule {}