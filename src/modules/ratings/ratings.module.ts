import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Rating, RatingSchema } from './schema/rating.schema';
import { RatingsController } from './ratings.controller';
import { RatingsService } from './ratings.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Rating.name, schema: RatingSchema }])],
  controllers: [RatingsController],
  providers: [RatingsService],
})
export class RatingModule {}