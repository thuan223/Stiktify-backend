import { ReactionType } from '@/modules/reaction-types/schemas/reaction-type.schema';
import { Video } from '@/modules/short-videos/schemas/short-video.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';

export type VideoReactionDocument = HydratedDocument<VideoReaction>;

@Schema({ timestamps: true })
export class VideoReaction {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Video' })
  videoId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'ReactionType' })
  reactionTypeId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  userId: MongooseSchema.Types.ObjectId;
}

export const VideoReactionSchema = SchemaFactory.createForClass(VideoReaction);
