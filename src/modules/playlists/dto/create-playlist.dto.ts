import { IsMongoId, IsNotEmpty } from "class-validator";

export class CreatePlaylistDto {
    @IsMongoId({ message: "userId invalid!" })
    @IsNotEmpty({ message: "userId can't be empty!" })
    userId: string

    @IsMongoId({ message: "musicId invalid!" })
    @IsNotEmpty({ message: "musicId can't be empty!" })
    musicId: string
}
