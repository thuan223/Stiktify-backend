import { forwardRef, Module } from '@nestjs/common';
import { MusicsService } from './musics.service';
import { MusicsController } from './musics.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Music, MusicSchema } from './schemas/music.schema';
import { Category, CategorySchema } from '../categories/schemas/category.schema';
import { MusicCategory, MusicCategorySchema } from '../music-categories/schemas/music-category.schema';
import { MusicCategoriesModule } from '../music-categories/music-categories.module';
import { CategoriesModule } from '../categories/categories.module';

@Module({
  imports: [
    MusicCategoriesModule,
    CategoriesModule,
    MongooseModule.forFeature([{ name: Music.name, schema: MusicSchema }]),
    MongooseModule.forFeature([{ name: Category.name, schema: CategorySchema }]),
    MongooseModule.forFeature([{ name: MusicCategory.name, schema: MusicCategorySchema }])
  ],
  controllers: [MusicsController],
  providers: [MusicsService],
  exports: [MusicsService, MongooseModule],
})
export class MusicsModule { }
