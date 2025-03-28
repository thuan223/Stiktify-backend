import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OrderDocument = Order & Document;

// Define a nested schema for product details
@Schema({ _id: false })
export class OrderProduct {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;

  @Prop({ required: true })
  productName: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  image: string;

  @Prop({ required: true })
  description: string;
  
  @Prop({ required: true })
  quantity: number;
}

@Schema({ timestamps: true })
export class Order {
  // Add this line to explicitly define _id
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  amount: number;

  @Prop({ enum: ['COD', 'VNPAY'], required: true })
  paymentMethod: string;
  
  @Prop({ required: true, default: false })
  isPaid: boolean; 

  @Prop({ enum: ['pending', 'completed', 'failed'], default: 'pending' })
  status: string;

  // Shipping information fields
  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true })
  phoneNumber: string;

  @Prop({ required: true })
  emailAddress: string;

  @Prop({ required: true })
  shippingAddress: string;

  // New products field with detailed product information
  @Prop({ type: [OrderProduct], required: true })
  products: OrderProduct[];
}

export const OrderSchema = SchemaFactory.createForClass(Order);