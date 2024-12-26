import { Category } from '@/modules/categories/schemas/category.schema';
import { Music } from '@/modules/musics/schemas/music.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type MusicCategoryDocument = HydratedDocument<MusicCategory>;

@Schema({ timestamps: true })
export class MusicCategory {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: Category.name })
  categoryId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: Music.name })
  musicId: MongooseSchema.Types.ObjectId;
}

export const MusicCategorySchema = SchemaFactory.createForClass(MusicCategory);
