import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Rating } from './schema/rating.schema';
import { CreateRatingDto } from './dto/create-rating.dto';

@Injectable()
export class RatingsService {
  constructor(
    @InjectModel(Rating.name)
    private ratingModel: Model<Rating>,
  ) {}

  // Create a new rating
  async create(userId: string, createRatingDto: CreateRatingDto): Promise<Rating> {
    try {
      return await this.ratingModel.create({ userId, ...createRatingDto });
    } catch (error) {
      console.error('Error creating rating:', error);
      throw new InternalServerErrorException('Failed to create rating');
    }
  }

  // Get all ratings
  async getAllRatings(): Promise<Rating[]> {
    return this.ratingModel.find().exec();
  }

  // Get ratings by productId
  async findByProduct(productId: string): Promise<Rating[]> {
    return this.ratingModel.find({ productId }).exec();
  }

  // Get ratings by userId
  async findByUser(userId: string): Promise<Rating[]> {
    return this.ratingModel.find({ userId }).exec();
  }
}