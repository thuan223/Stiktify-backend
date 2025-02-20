import { Music } from '@/modules/musics/schemas/music.schema';
import { User } from '@/modules/users/schemas/user.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type PlaylistDocument = HydratedDocument<Playlist>;

@Schema({ timestamps: true })
export class Playlist {
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: User.name })
    userId: MongooseSchema.Types.ObjectId;

    @Prop({ default: "" })
    name: string;

    @Prop({ default: "" })
    description: string;

    @Prop({ default: "" })
    image: string
}
export const PlaylistSchema = SchemaFactory.createForClass(Playlist);