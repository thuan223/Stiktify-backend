import { IsString, IsNotEmpty } from 'class-validator';

export class CreateCategoryProductsDto {
  @IsString()
  @IsNotEmpty()
  categoryProductName: string;
}
