import { Music } from '@/modules/musics/schemas/music.schema';
import { User } from '@/modules/users/schemas/user.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';

export type ReportDocument = HydratedDocument<Report>;
@Schema({ timestamps: true })
export class MusicFavorite {
  @Prop({ type: Types.ObjectId, ref: User.name })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Music.name })
  musicId: Types.ObjectId;
}

export const MusicFavoriteSchema = SchemaFactory.createForClass(MusicFavorite);
