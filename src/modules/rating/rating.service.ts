// src/rating/rating.service.ts
import { 
  Injectable, 
  BadRequestException, 
  NotFoundException 
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order } from '../order/schemas/order.schema';
import { Rating } from './schema/rating.schema';
import { Product } from '../products/schemas/product.schema';

interface CreateRatingInput {
  orderId: string;
  userId: string;
  rating: number;
}

@Injectable()
export class RatingService {
  constructor(
      @InjectModel(Rating.name) private ratingModel: Model<Rating>,
      @InjectModel(Order.name) private orderModel: Model<Order>,
      @InjectModel(Product.name) private productModel: Model<Product>
  ) {}

  async createRating(input: CreateRatingInput) {
      // Find the order and validate
      const order = await this.orderModel.findById(input.orderId);
      if (!order) {
          throw new NotFoundException('Order not found');
      }

      // Check if order is completed/received
      const allowedStatuses = ['completed', 'received'];
      if (!allowedStatuses.includes(order.status.toLowerCase())) {
          throw new BadRequestException('Cannot rate this order');
      }

      // Check if order contains products
      if (!order.products || order.products.length === 0) {
          throw new BadRequestException('No products found in this order');
      }

      // Get the first product from the order
      const productId = order.products[0];
      const product = await this.productModel.findById(productId);
      if (!product) {
          throw new NotFoundException('Product not found');
      }

      // Check if user has already rated this order
      const existingRating = await this.ratingModel.findOne({
          order: input.orderId,
          user: input.userId
      });

      if (existingRating) {
          throw new BadRequestException('You have already rated this order');
      }

      // Create new rating
      const rating = new this.ratingModel({
          user: input.userId,
          product: product._id,
          order: input.orderId,
          rating: input.rating
      });

      // Save rating
      await rating.save();

      // Update order with user rating
      await this.orderModel.findByIdAndUpdate(input.orderId, {
          userRating: input.rating
      });

      // Recalculate product average rating
      await this.recalculateProductAverageRating(product._id.toString());

      return { data: order };
  }

  private async recalculateProductAverageRating(productId: string) {
      const ratings = await this.ratingModel.find({ product: productId });
      
      if (ratings.length > 0) {
          const averageRating = 
              ratings.reduce((sum, rating) => sum + rating.rating, 0) / ratings.length;

          await this.productModel.findByIdAndUpdate(productId, {
              averageRating: Number(averageRating.toFixed(1))
          });
      }
  }
}