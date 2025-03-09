import { forwardRef, Module } from '@nestjs/common';
import { MusicCategoriesService } from './music-categories.service';
import { MusicCategoriesController } from './music-categories.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  MusicCategory,
  MusicCategorySchema,
} from './schemas/music-category.schema';
import { CategoriesModule } from '../categories/categories.module';
import { Music, MusicSchema } from '../musics/schemas/music.schema';

@Module({
  imports: [
    CategoriesModule,
    MongooseModule.forFeature([{ name: Music.name, schema: MusicSchema }]),
    MongooseModule.forFeature([
      { name: MusicCategory.name, schema: MusicCategorySchema },
    ]),
  ],
  controllers: [MusicCategoriesController],
  providers: [MusicCategoriesService],
  exports: [MusicCategoriesService, MongooseModule],
})
export class MusicCategoriesModule { }
