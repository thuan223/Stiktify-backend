import { Category } from '@/modules/categories/schemas/category.schema';
import { Video } from '@/modules/short-videos/schemas/short-video.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type VideoCategoryDocument = HydratedDocument<VideoCategory>;

@Schema({ timestamps: true })
export class VideoCategory {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: Category.name })
  categoryId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: Video.name })
  videoId: MongooseSchema.Types.ObjectId;
}

export const VideoCategorySchema = SchemaFactory.createForClass(VideoCategory);
