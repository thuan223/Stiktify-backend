import { User } from '@/modules/users/schemas/user.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type MusicDocument = HydratedDocument<Music>;

@Schema({ timestamps: true })
export class Music {
  @Prop()
  MusicUrl: string;

  @Prop({ default: 0, min: 0 })
  totalFavorite: number;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: User.name })
  userId: MongooseSchema.Types.ObjectId;

  @Prop()
  musicDescription: string;

  @Prop({ default: false })
  isBlock: boolean;

  @Prop()
  musicThumbnail: string;

  @Prop()
  musicTag: string[];

  @Prop({ default: 0, min: 0 })
  totalListener: number;

  @Prop()
  musicLyric: string;
}

export const MusicSchema = SchemaFactory.createForClass(Music);
