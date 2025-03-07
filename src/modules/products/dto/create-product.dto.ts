import { IsMongoId, IsNotEmpty, IsOptional, IsNumber, IsString } from "class-validator";
import { ObjectId, Types } from "mongoose";

export class CreateProductDto {
        @IsNotEmpty()
    userId: Types.ObjectId;

    @IsNotEmpty({ message: "productName must not be empty" })
    @IsString({ message: "productName must be a string" })
    productName: string;

    @IsNotEmpty({ message: "productCategory must not be empty" })
    productCategory: Types.ObjectId[];

    @IsOptional()
    @IsString({ message: "productDescription must be a string" })
    productDescription?: string;

    @IsNotEmpty({ message: "productPrice must not be empty" })
    @IsNumber({}, { message: "productPrice must be a number" })
    productPrice: number;

    @IsOptional()
    @IsString({ message: "productColor must be a string" })
    productColor?: string;

    @IsNotEmpty({ message: "stock must not be empty" })
    @IsNumber({}, { message: "stock must be a number" })
    stock: number;

    @IsOptional()
    @IsString({ message: "image must be a string" })
    image: string;
}
