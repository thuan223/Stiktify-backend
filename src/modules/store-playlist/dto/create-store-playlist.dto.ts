import { IsMongoId, IsNotEmpty } from "class-validator";

export class CreateStorePlaylistDto {
    @IsMongoId({ message: "playlistId invalid!" })
    @IsNotEmpty({ message: "playlistId can't be empty!" })
    playlistId: string

    @IsMongoId({ message: "musicId invalid!" })
    @IsNotEmpty({ message: "musicId can't be empty!" })
    musicId: string
}