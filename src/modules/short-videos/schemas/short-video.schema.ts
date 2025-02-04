import { Music } from '@/modules/musics/schemas/music.schema';
import { User } from '@/modules/users/schemas/user.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type VideoDocument = HydratedDocument<Video>;

@Schema({ timestamps: true })
export class Video {
  @Prop()
  videoUrl: string;

  @Prop({ default: 0, min: 0 })
  totalReaction: number;

  @Prop({ default: 0, min: 0 })
  totalViews: number;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: User.name })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: Music.name })
  musicId: MongooseSchema.Types.ObjectId;

  @Prop()
  videoDescription: string;

  @Prop({ default: false })
  isBlock: boolean;

  @Prop()
  videoThumbnail: string;

  @Prop()
  videoTag: string[];

  @Prop()
  totalComment: number;

  @Prop()
  videoType: string;

  @Prop({ default: false })
  isDelete: boolean;

  @Prop({ default: false })
  flag: boolean;
}

export const VideoSchema = SchemaFactory.createForClass(Video);
