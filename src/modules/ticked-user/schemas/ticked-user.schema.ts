import { User } from '@/modules/users/schemas/user.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TickedUserDocument = TickedUser & Document;

@Schema({ timestamps: true })
export class TickedUser {
  @Prop({ type: Types.ObjectId, ref: User.name })
  userId: string;

  @Prop({ enum: ['pending', 'approved', 'rejected'], default: 'pending' })
  status: string;
}

export const TickedUserSchema = SchemaFactory.createForClass(TickedUser);
