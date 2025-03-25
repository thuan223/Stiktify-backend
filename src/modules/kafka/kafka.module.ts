import { Module } from '@nestjs/common';
import { KafkaService } from './kafka.service';
import { KafkaController } from './kafka.controller';
import { VideoCategoriesModule } from '../video-categories/video-categories.module';
import { ShortVideosModule } from '../short-videos/short-videos.module';
import { CategoriesModule } from '../categories/categories.module';
import { MusicCategoriesModule } from '../music-categories/music-categories.module';
import { MusicsModule } from '../musics/musics.module';

@Module({
  imports: [VideoCategoriesModule, ShortVideosModule, CategoriesModule, MusicCategoriesModule, MusicsModule],
  controllers: [KafkaController],
  providers: [KafkaService],
})
export class KafkaModule {}
