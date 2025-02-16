import { Music } from '@/modules/musics/schemas/music.schema';
import { User } from '@/modules/users/schemas/user.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type PlaylistDocument = HydratedDocument<Playlist>;

@Schema({ timestamps: true })
export class Playlist {
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: User.name })
    userId: string

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: Music.name })
    musicId: string
}
export const PlaylistSchema = SchemaFactory.createForClass(Playlist);