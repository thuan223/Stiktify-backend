import { Music } from "@/modules/musics/schemas/music.schema";
import { User } from "@/modules/users/schemas/user.schema";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type ListeningHistoryDocument = HydratedDocument<ListeningHistory>;

@Schema({ timestamps: true })
export class ListeningHistory {
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: Music.name })
    musicId: MongooseSchema.Types.ObjectId;
  
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: User.name })
    userId: MongooseSchema.Types.ObjectId;
}

export const ListeningHistorySchema = SchemaFactory.createForClass(ListeningHistory);
