import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OrderDocument = Order & Document;

@Schema({ timestamps: true })
export class Order {
  // Add this line to explicitly define _id
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;

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
}

export const OrderSchema = SchemaFactory.createForClass(Order);