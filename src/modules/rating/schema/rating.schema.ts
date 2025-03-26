// src/rating/schemas/rating.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { Order } from '../../order/schemas/order.schema';
import { Product } from '../../products/schemas/product.schema';

@Schema({ timestamps: true })
export class Rating extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  user: User;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Product', required: true })
  product: Product;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Order', required: true })
  order: Order;

  @Prop({ required: true, min: 1, max: 5 })
  rating: number;
}

export const RatingSchema = SchemaFactory.createForClass(Rating);