import { IsMongoId, IsNotEmpty, IsOptional } from "class-validator";

export class CreatePlaylistDto {
    @IsMongoId({ message: "userId invalid!" })
    @IsNotEmpty({ message: "userId can't be empty!" })
    userId: string

    @IsOptional()
    name: string

    @IsOptional()
    description: string

    @IsOptional()
    image: string
}
