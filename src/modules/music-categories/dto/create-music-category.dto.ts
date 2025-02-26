import { IsMongoId, IsNotEmpty } from "class-validator"

export class CreateMusicCategoryDto {
    @IsMongoId({ message: "categoryId invalid!" })
    @IsNotEmpty({ message: "categoryId can't be empty!" })
    categoryId: string[]

    @IsMongoId({ message: "musicId invalid!" })
    @IsNotEmpty({ message: "musicId can't be empty!" })
    musicId: string
}
