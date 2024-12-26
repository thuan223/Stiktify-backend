import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { User } from '@/modules/users/schemas/user.schema';
import { Chat } from '@/modules/chats/schemas/chat.schema';
export type MessageDocument = HydratedDocument<Message>;

class MessageReader {
  @Prop()
  status: string;
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: User.name })
  userId: MongooseSchema.Types.ObjectId;
  @Prop()
  timestamp: Date;
}
@Schema({ timestamps: true })
export class Message {
  @Prop()
  type: string;
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: Chat.name })
  chatId: MongooseSchema.Types.ObjectId;
  @Prop()
  content: string;
  @Prop({ type: [MessageReader], default: [] })
  messageReader: MessageReader[];
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: User.name })
  senderId: MongooseSchema.Types.ObjectId;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
