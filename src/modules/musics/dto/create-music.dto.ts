import { IsMongoId, IsNotEmpty } from "class-validator";

export class CreateMusicDto {
    @IsNotEmpty({ message: 'musicUrl must not be empty' })
    musicUrl: string;

    @IsMongoId({ message: "userId invalid!" })
    @IsNotEmpty({ message: "userId can't be empty!" })
    userId: string

    @IsNotEmpty({ message: 'musicDescription must not be empty' })
    musicDescription: string;

    @IsNotEmpty({ message: 'musicThumbnail must not be empty' })
    musicThumbnail: string;

    @IsNotEmpty({ message: 'musicTag must not be empty' })
    musicTag: string[];

    @IsNotEmpty({ message: 'musicLyric must not be empty' })
    musicLyric: string;

    @IsNotEmpty({ message: 'musicLyric must not be empty' })
    categoryId: string[];
}
