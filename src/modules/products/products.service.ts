import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name)
    private productModel: Model<Product>,
  ) {}

  // create a new product - ThangLH
  async create(createProductDto: CreateProductDto): Promise<Product> {
    try {
      const newProduct = new this.productModel({
        ...createProductDto,
        isDelete: false,
      });
      return await newProduct.save();
    } catch (error) {
      throw new Error(`Error creating product: ${error.message}`);
    }
  }

  // get all products - ThangLH
async findAll(): Promise<Product[]> {
  return this.productModel.find({ isDelete: false }).exec();
}

// get all products by userId - ThangLH
async findByUser(userId: string): Promise<Product[]> {
  return this.productModel.find({ userId, isDelete: false }).exec();
}


  // edit product - ThangLH
  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product | null> {
    const product = await this.productModel.findOne({ _id: id, isDelete: false });
  
    if (!product) {
      throw new Error('Product not found or has been deleted');
    }
  
    return this.productModel.findByIdAndUpdate(id, updateProductDto, { new: true }).exec();
  }
  
// delete product - ThangLH
  async remove(id: string): Promise<Product | null> {
  return this.productModel.findByIdAndUpdate(
    id,
    { isDelete: true },
    { new: true } 
  ).exec();
}

  async findByCategory(category: string): Promise<Product[]> {
    return this.productModel.find({ productCategory: category, isDelete: false }).exec();
  }
// search products - ThangLH
async searchProducts(filters: any): Promise<Product[] | { message: string }> {
  const query: any = { isDelete: false };

  if (filters.name) {
    query.productName = { $regex: filters.name, $options: 'i' };
  }
  if (filters.category) {
    query.productCategory = filters.category;
  }
  if (filters.minPrice) {
    query.productPrice = { ...query.productPrice, $gte: parseFloat(filters.minPrice) };
  }
  if (filters.maxPrice) {
    query.productPrice = { ...query.productPrice, $lte: parseFloat(filters.maxPrice) };
  }
  if (filters.color) {
    query.productColor = filters.color;
  }

  const products = await this.productModel.find(query).exec();
  
  if (products.length === 0) {
    return { message: "Not found" };
  }

  return products;
}

}
