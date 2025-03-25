import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './schemas/product.schema';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // create a new product - ThangLH
  @Post()
  async create(@Body() createProductDto: CreateProductDto) {
    return await this.productsService.create(createProductDto);
  }

  @Get('list-product')
  findAllProduct(
    @Query() query: string,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ) {
    return this.productsService.handleGetListProduct(query, +current, +pageSize);
  }

  @Get('product-details/:id')
  findProductById(@Param('id') id: string) {
  return this.productsService.handleGetProductById(id);
}

  // get all products - ThangLH
  @Get()
  findAll() {
    return this.productsService.findAll();
  }
// search products - ThangLH
@Get('search')
searchProducts(
  @Query('name') name?: string,
  @Query('category') category?: string,
  @Query('minPrice') minPrice?: string,
  @Query('maxPrice') maxPrice?: string,
  // @Query('color') color?: string
) {
  return this.productsService.searchProducts({ name, category, minPrice, maxPrice });
}

 @Get('user/:userId')
findByUser(@Param('userId') userId: string) {
  return this.productsService.findByUser(userId);
}

// Eidt product - ThangLH 
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }
  
// Delete product - ThangLH
  @Post(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }

  @Get('category/:category')
  findByCategory(@Param('category') category: string) {
    return this.productsService.findByCategory(category);
  }
}
