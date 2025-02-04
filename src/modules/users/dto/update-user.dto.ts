import { IsDateString, IsMongoId, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class UpdateUserDto {
    @IsMongoId({ message: "_id invalid!!!" })
    @IsNotEmpty({ message: "_id not empty!!!" })
    _id: string

    @IsOptional()
    fullname: string;

    @IsOptional()
    @IsString()
    email: string;

    @IsOptional()
    phone: string;

    @IsOptional()
    @IsDateString({}, { message: 'Invalid date format! Must be in YYYY-MM-DD format.' })
    dob: string;

    @IsOptional()
    @IsString()
    address: string;

    @IsOptional()
    isBan: boolean;

    @IsOptional()
    isActive: boolean;

    @IsOptional()
    image: string
}
