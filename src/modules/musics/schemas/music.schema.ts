import { User } from '@/modules/users/schemas/user.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type MusicDocument = HydratedDocument<Music>;

@Schema({ timestamps: true })
export class Music {
  @Prop()
  musicUrl: string;

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

  @Prop({ default: 0, min: 0 })
  totalComment: number;

  @Prop({ default: 0, min: 0 })
  totalReactions: number;

  @Prop({ default: 0, min: 0 })
  totalShare: number;

  @Prop()
  musicLyric: { start: number, end: number, text: string }[];

  @Prop({ default: false })
  flag: boolean;

  @Prop({ default: false })
  isDelete: boolean;

  @Prop()
  listeningAt: Date

  @Prop({ default: 0 })
  totalListeningOnWeek: number

  @Prop({ type: [String], default: [] })
  musicSeparate: string[];
}

export const MusicSchema = SchemaFactory.createForClass(Music);
