import { ReactionType } from '@/modules/reaction-types/schemas/reaction-type.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type CommentReactionDocument = HydratedDocument<CommentReaction>;

@Schema({ timestamps: true })
export class CommentReaction {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: CommentReaction.name })
  commentId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: ReactionType.name })
  reactionTypeId: MongooseSchema.Types.ObjectId;
}

export const CommentReactionSchema =
  SchemaFactory.createForClass(CommentReaction);
