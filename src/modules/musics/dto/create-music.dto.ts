import { IsMongoId, IsNotEmpty } from "class-validator";

export class CreateMusicDto {
    @IsNotEmpty({ message: 'Name must not be empty' })
    musicUrl: string;

    @IsMongoId({ message: "userId invalid!" })
    @IsNotEmpty({ message: "userId can't be empty!" })
    userId: string

    @IsNotEmpty({ message: 'Name must not be empty' })
    musicDescription: string;

    @IsNotEmpty({ message: 'Name must not be empty' })
    musicThumbnail: string;

    @IsNotEmpty({ message: 'Name must not be empty' })
    musicTag: string[];

    @IsNotEmpty({ message: 'Name must not be empty' })
    musicLyric: string;
}
