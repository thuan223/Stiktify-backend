import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type ReactionTypeDocument = HydratedDocument<ReactionType>;

@Schema({ timestamps: true })
export class ReactionType {
  @Prop()
  reactionTypeName: string;
}

export const ReactionTypeSchema = SchemaFactory.createForClass(ReactionType);
