import { Music } from '@/modules/musics/schemas/music.schema';
import { Video } from '@/modules/short-videos/schemas/short-video.schema';
import { User } from '@/modules/users/schemas/user.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';

export type CommentDocument = HydratedDocument<Comment>;

@Schema({ timestamps: true })
export class Comment {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: User.name })
  userId: Types.ObjectId | User;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: Video.name })
  videoId: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: Comment.name,
    default: null,
  })
  parentId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: Music.name })
  musicId: MongooseSchema.Types.ObjectId;

  @Prop({ default: 0, min: 0 })
  totalOfChildComments: number;

  @Prop({ default: 0, min: 0 })
  totalReactions: number;

  @Prop()
  CommentDescription: string;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
