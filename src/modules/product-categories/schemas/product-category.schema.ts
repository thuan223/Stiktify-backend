import { Category } from '@/modules/categories/schemas/category.schema';
import { Product } from '@/modules/products/schemas/product.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type ProductCategoryDocument = HydratedDocument<ProductCategory>;

@Schema({ timestamps: true })
export class ProductCategory {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: Category.name })
  categoryId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: Product.name })
  productId: MongooseSchema.Types.ObjectId;
}

export const ProductCategorySchema = SchemaFactory.createForClass(ProductCategory);
