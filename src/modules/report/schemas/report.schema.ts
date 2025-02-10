import { Video } from "@/modules/short-videos/schemas/short-video.schema";
import { User } from "@/modules/users/schemas/user.schema";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Schema as MongooseSchema } from "mongoose";
export type ReportDocument = HydratedDocument<Report>;
@Schema({ timestamps: true })
export class Report {
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: Video.name })
    videoId: MongooseSchema.Types.ObjectId;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: User.name })
    userId: MongooseSchema.Types.ObjectId;

    @Prop()
    reasons: string
}
export const ReportSchema = SchemaFactory.createForClass(Report);