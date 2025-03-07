import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CategoryProductDocument = HydratedDocument<CategoryProduct>;

@Schema({ timestamps: true })
export class CategoryProduct {
  @Prop()
  categoryProductName: string;
}

export const CategoryProductSchema = SchemaFactory.createForClass(CategoryProduct);