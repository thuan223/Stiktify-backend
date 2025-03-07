import { IsArray, ArrayNotEmpty, IsMongoId, IsNotEmpty } from "class-validator";

export class CreateProductCategoryDto {
    @IsArray()
    @ArrayNotEmpty()
    @IsMongoId({ each: true, message: "categoryId invalid!" }) 
    categoryId: string[];

    @IsMongoId({ message: "productId invalid!" })
    @IsNotEmpty({ message: "productId can't be empty!" })
    productId: string;
}
