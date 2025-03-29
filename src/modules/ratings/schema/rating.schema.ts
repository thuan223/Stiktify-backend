import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true }) // Thêm timestamps để có createdAt, updatedAt
export class Rating extends Document {
  @Prop({ required: true })
  productId: string;

  @Prop({ required: true })
  userId: string;

  @Prop()
  description: string;

  @Prop({ required: true, min: 1, max: 5 }) 
  star: number;
}

export const RatingSchema = SchemaFactory.createForClass(Rating);