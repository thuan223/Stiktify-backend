import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CategoryProductsService } from './category-products.service';
import { CreateCategoryProductsDto } from './dto/create-category-product.dto';
import { UpdateCategoryProductsDto } from './dto/update-category-product.dto';
import { Public } from '@/decorator/customize';

@Controller('category-for-products')
export class CategoryProductsController {
  constructor(private readonly categoryProductsService: CategoryProductsService) {}

  @Post()
  create(@Body() createCategoryProductDto: CreateCategoryProductsDto) {
    return this.categoryProductsService.createCategoryProduct(createCategoryProductDto);
  }
  

  @Public()
  @Get('list-category-products')
  getAllCategoryProducts() {
    return this.categoryProductsService.handleGetAllCategoryProducts();
  }

  @Get()
  findAll() {
    return this.categoryProductsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoryProductsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCategoryProductDto: CreateCategoryProductsDto) {
    return this.categoryProductsService.update(id, updateCategoryProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoryProductsService.remove(id);
  }
}
