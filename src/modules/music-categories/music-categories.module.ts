import { Module } from '@nestjs/common';
import { MusicCategoriesService } from './music-categories.service';
import { MusicCategoriesController } from './music-categories.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  MusicCategory,
  MusicCategorySchema,
} from './schemas/music-category.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MusicCategory.name, schema: MusicCategorySchema },
    ]),
  ],
  controllers: [MusicCategoriesController],
  providers: [MusicCategoriesService],
  exports: [MusicCategoriesService],
})
export class MusicCategoriesModule {}
