import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoryProductsDto } from './create-category-product.dto';

export class UpdateCategoryProductsDto extends PartialType(CreateCategoryProductsDto) {}
