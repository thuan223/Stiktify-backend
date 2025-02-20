import { Music } from "@/modules/musics/schemas/music.schema";
import { Playlist } from "@/modules/playlists/schemas/playlist.schema";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Schema as MongooseSchema } from "mongoose";
export type StorePlaylistDocument = HydratedDocument<StorePlaylist>;

@Schema({ timestamps: true })
export class StorePlaylist {
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: Playlist.name })
    playlistId: MongooseSchema.Types.ObjectId;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: Music.name })
    musicId: MongooseSchema.Types.ObjectId;
}
export const StorePlaylistSchema = SchemaFactory.createForClass(StorePlaylist);