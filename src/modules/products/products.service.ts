import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import aqp from 'api-query-params';

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

  async handleGetListProduct(query: string, current: number, pageSize: number) {
    const { filter, sort } = aqp(query);

    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;

    if (!current) current = 1;
    if (!pageSize) pageSize = 10;

    //Tính tổng số lượng
    const totalItems = (await this.productModel.find(filter)).length;
    //Tính tổng số trang
    const totalPages = Math.ceil(totalItems / pageSize);

    const skip = (+current - 1) * +pageSize;

    const result = await this.productModel
      .find(filter)
      .limit(pageSize)
      .skip(skip)
      .sort(sort as any);

    return {
      meta: {
        current: current, // trang hien tai
        pageSize: pageSize, // so luong ban ghi
        pages: totalPages, // tong so trang voi dieu kien query
        total: totalItems, // tong so ban ghi
      },
      result: result,
    };
  }

  async handleGetProductById(id: string) {
    const result = await this.productModel.findById(id);
    if (!result) {
      throw new Error('Product not found');
    }
    return result;
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
  // if (filters.color) {
  //   query.productColor = filters.color;
  // }

  const products = await this.productModel.find(query).exec();
  
  if (products.length === 0) {
    return { message: "Not found" };
  }

  return products;
}

async handleSearchProduct(
  query: any,
  current: number,
  pageSize: number,
) {
  current = current && !isNaN(Number(current)) ? Number(current) : 1;
  pageSize = pageSize && !isNaN(Number(pageSize)) ? Number(pageSize) : 10;
  let handleSearch = [];
  if (
    query.search &&
    typeof query.search === 'string' &&
    query.search.trim().length > 0
  ) {
    const searchRegex = new RegExp(query.search, 'i');
    handleSearch = [{ productName: searchRegex }];
  }
  const filterQuery = handleSearch.length > 0 ? { $or: handleSearch } : {};
  const totalItems = await this.productModel.countDocuments(filterQuery);
  const totalPages = Math.ceil(totalItems / pageSize);
  const skip = (current - 1) * pageSize;
  const result = await this.productModel
    .find(filterQuery)
    .limit(pageSize)
    .skip(skip)
    .sort(query.sort || {});
  return {
    meta: {
      current,
      pageSize,
      total: totalItems,
      pages: totalPages,
    },
    result,
  };
}
}

