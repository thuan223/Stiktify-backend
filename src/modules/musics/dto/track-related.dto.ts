import { IsArray, IsMongoId, IsNotEmpty, IsOptional } from "class-validator";
import { Types } from "mongoose";

export class TrackRelatedDto {
    @IsArray({ message: "musicId array!" })
    @IsNotEmpty({ message: 'musicId must not be empty' })
    musicId: string[];


    @IsOptional()
    musicTag: TagDto[]
}

class TagDto {
    @IsNotEmpty({ message: '_id must not be empty' })
    _id: string[];

    @IsNotEmpty({ message: "userId can't be empty!" })
    fullname: string
}
