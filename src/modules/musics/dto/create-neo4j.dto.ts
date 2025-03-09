import { IsMongoId, IsNotEmpty } from "class-validator";
import { Types } from "mongoose";

export class CreateNeo4j {
    @IsMongoId({ message: "userId invalid!" })
    @IsNotEmpty({ message: "userId invalid!" })
    userId: Types.ObjectId

    @IsMongoId({ message: "musicId invalid!" })
    @IsNotEmpty({ message: "musicId invalid!" })
    musicId: Types.ObjectId
}
