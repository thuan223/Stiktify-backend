import { IsMongoId, IsNotEmpty, IsOptional } from "class-validator";

export class UpdateUserDto {
    @IsMongoId({ message: "_id invalid!!!" })
    @IsNotEmpty({ message: "_id not empty!!!" })
    _id: string

    @IsOptional()
    fullname: string;

    @IsOptional()
    isBan: boolean;

    @IsOptional()
    isActive: boolean;

    @IsOptional()
    image: string
}
