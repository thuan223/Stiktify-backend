import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { User } from '@/modules/users/schemas/user.schema';

export type ChatDocument = HydratedDocument<Chat>;

class LastMessage {
  @Prop()
  content: string;
  @Prop()
  timestamp: Date;
}
class Participants {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: User.name })
  userId: MongooseSchema.Types.ObjectId;
  @Prop({ default: 'Member' })
  role: string;
  @Prop()
  timestamp: Date;
}
@Schema({ timestamps: true })
export class Chat {
  @Prop()
  chatType: string;
  @Prop()
  groupPicture: string;
  @Prop()
  groupName: string;
  @Prop({ type: LastMessage })
  lastMessageId: LastMessage;
  @Prop({ type: [Participants], default: [] })
  participants: Participants[];
}

export const ChatSchema = SchemaFactory.createForClass(Chat);
