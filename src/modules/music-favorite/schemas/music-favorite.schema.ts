import { Music } from "@/modules/musics/schemas/music.schema";
import { User } from "@/modules/users/schemas/user.schema";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument,Schema as MongooseSchema } from "mongoose";

export type ReportDocument = HydratedDocument<Report>;
@Schema({ timestamps: true })
export class MusicFavorite {
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: User.name })
    userId: MongooseSchema.Types.ObjectId;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: Music.name })
    musicId: string;
}
export const MusicFavoriteSchema = SchemaFactory.createForClass(MusicFavorite);