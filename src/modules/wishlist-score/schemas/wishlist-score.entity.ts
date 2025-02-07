
import { Category } from '@/modules/categories/schemas/category.schema';
import { Music } from '@/modules/musics/schemas/music.schema';
import { Video } from '@/modules/short-videos/schemas/short-video.schema';
import { User } from '@/modules/users/schemas/user.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type WishListScoreDocument = HydratedDocument<WishlistScore>;

@Schema({ timestamps: true })
export class WishlistScore {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: User.name })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({ default: 0, min: 0 })
  score: number;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: User.name })
  creatorId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: Category.name })
  categoryId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: Music.name })
  musicId: MongooseSchema.Types.ObjectId;

  @Prop()
  tag: string;

  @Prop()
  wishlistType: string;

  @Prop({default:false})
  wasCheck: boolean;
}

export const WishlistScoreSchema =
  SchemaFactory.createForClass(WishlistScore);
