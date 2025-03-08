import { Module } from '@nestjs/common';
import { CategoryProductsService } from './category-products.service';
import { CategoryProductsController } from './category-products.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CategoryProduct, CategoryProductSchema } from './schemas/category-products.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CategoryProduct.name, schema: CategoryProductSchema },
    ]),
  ],
  controllers: [CategoryProductsController],
  providers: [CategoryProductsService],
  exports: [CategoryProductsService],
})
export class CategoryProductsModule {}