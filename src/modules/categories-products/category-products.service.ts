import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CategoryProduct } from './schemas/category-products.schema';
import { CreateCategoryProductsDto } from './dto/create-category-product.dto';
import { UpdateCategoryProductsDto } from './dto/update-category-product.dto';

@Injectable()
export class CategoryProductsService {
  constructor(
    @InjectModel(CategoryProduct.name)
    private categoryProductModel: Model<CategoryProduct>,
  ) {}

  async createCategoryProduct(createCategoryProductDto: CreateCategoryProductsDto) {
    const existingCategory = await this.categoryProductModel.findOne({
      categoryProductName: createCategoryProductDto.categoryProductName
    }).exec();
  
    if (existingCategory) {
      throw new Error('Category product already exists');
    }
  
    const newCategory = new this.categoryProductModel(createCategoryProductDto);
    return newCategory.save();
  }
  

  async findAll(): Promise<CategoryProduct[]> {
    return this.categoryProductModel.find().exec();
  }

  async handleGetAllCategoryProducts() {
    return this.categoryProductModel.find().exec();
  }

  async findOne(id: string) {
    return this.categoryProductModel.findById(id).exec();
  }

  async update(id: string, updateCategoryProductDto: CreateCategoryProductsDto) {
    return this.categoryProductModel.findByIdAndUpdate(id, updateCategoryProductDto, { new: true }).exec();
  }

  async remove(id: string) {
    return this.categoryProductModel.findByIdAndDelete(id).exec();
  }
}
