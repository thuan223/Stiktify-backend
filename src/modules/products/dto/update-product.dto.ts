import { IsBoolean, IsMongoId, IsNumber, IsOptional, IsString } from "class-validator";

export class UpdateProductDto {
    @IsOptional()
    @IsString({ message: "productName must be a string" })
    productName?: string;

    @IsOptional()
    @IsString({ message: "productCategory must be a string" })
    productCategory?: string;

    @IsOptional()
    @IsString({ message: "productDescription must be a string" })
    productDescription?: string;

    @IsOptional()
    @IsNumber({}, { message: "productPrice must be a number" })
    productPrice?: number;

    @IsOptional()
    @IsString({ message: "productColor must be a string" })
    productColor?: string;

    @IsOptional()
    @IsNumber({}, { message: "stock must be a number" })
    stock?: number;

    @IsOptional()
    @IsString({ message: "image must be a string" })
    image?: string;

    @IsOptional()
    @IsBoolean({ message: "isDelete must be a boolean" })
    isDelete?: boolean;
}
