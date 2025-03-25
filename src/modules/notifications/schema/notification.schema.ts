import { FriendRequest } from '@/modules/friend-request/schema/friend-request.schema';
import { User } from '@/modules/users/schemas/user.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type NotificationDocument = Notification & Document;

@Schema({ timestamps: true })
export class Notification {
  @Prop({ type: Types.ObjectId, ref: User.name })
  recipient: string;

  @Prop({ type: Types.ObjectId, ref: User.name })
  sender: string;

  @Prop({ required: true })
  type: string;

  @Prop({ required: false })
  postId?: string;

  @Prop({ required: false })
  musicId?: string;

  @Prop({
    enum: ['pending', 'accepted', 'rejected', 'read'],
    default: 'pending',
  })
  status: string;

  @Prop({ type: Types.ObjectId, ref: FriendRequest.name })
  friendRequestId?: Types.ObjectId;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
