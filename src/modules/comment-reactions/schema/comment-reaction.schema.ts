
import { ReactionType } from '@/modules/report/reaction-types/schemas/reaction-type.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';

export type CommentReactionDocument = HydratedDocument<CommentReaction>;

@Schema({ timestamps: true })
export class CommentReaction {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: CommentReaction.name })
  commentId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: CommentReaction.name })
  userId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: ReactionType.name })
  reactionTypeId: Types.ObjectId;
}

export const CommentReactionSchema =
  SchemaFactory.createForClass(CommentReaction);
