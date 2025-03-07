import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ProductCategory } from './schemas/product-category.schema';
import { Model } from 'mongoose';
import { CreateProductCategoryDto } from './dto/create-product-category.dto';
import { UpdateProductCategoryDto } from './dto/update-product-category.dto';
import { Types } from 'mongoose';

@Injectable()
export class ProductCategoriesService {
  constructor(
    @InjectModel(ProductCategory.name) private productCategoryModel: Model<ProductCategory>,
  ) {}


  async handleCreateCategoryProduct(categoryId: string[], productId: string) {
    if (!Types.ObjectId.isValid(productId)) {
      throw new Error('Invalid productId');
    }
  
    for (const catId of categoryId) {
      if (!Types.ObjectId.isValid(catId)) {
        throw new Error(`Invalid categoryId: ${catId}`);
      }
      // Kiểm tra xem category-product đã tồn tại chưa
      const exists = await this.productCategoryModel.findOne({ categoryId: catId, productId });
      if (exists) {
        throw new Error('Category product already exists');
      }
  
      await this.productCategoryModel.create({ categoryId: catId, productId });
    }
    return { message: 'ProductCategory created successfully' };
  }
  

  findAll() {
    return `This action returns all productCategories`;
  }

  findOne(id: string) {
    return `This action returns a #${id} productCategory`;
  }

  update(id: string, updateProductCategoryDto: UpdateProductCategoryDto) {
    return `This action updates a #${id} productCategory`;
  }

  remove(id: string) {
    return `This action removes a #${id} productCategory`;
  }
}