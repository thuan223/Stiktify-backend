import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ProductDocument = HydratedDocument<Product>;

@Schema({ timestamps: true })
export class Product {
  @Prop({ type: Types.ObjectId, required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  productName: string;

  @Prop({ required: true })
  productCategory: string;

  @Prop()
  productDescription: string;

  @Prop({ required: true })
  productPrice: number;

  @Prop()
  productColor: string;

  @Prop({ required: true })
  stock: number;

  @Prop()
  image: string;

  @Prop({ default: false })
  isDelete: boolean;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
