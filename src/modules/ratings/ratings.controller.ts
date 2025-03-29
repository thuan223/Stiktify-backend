import { Controller, Post, Body, Get, Param, UseGuards, Req, BadRequestException } from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { JwtAuthGuard } from '@/auth/passport/jwt-auth.guard';

@Controller('ratings')
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  // Create a new rating
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createRatingDto: CreateRatingDto, @Req() req: any) {
    console.log('User from JWT:', req.user); // Debug user object
    const userId = req.user?._id;
    if (!userId) {
      throw new BadRequestException('User ID not found in request');
    }

    if (createRatingDto.star < 1 || createRatingDto.star > 5) {
      throw new BadRequestException('Rating star must be between 1 and 5');
    }

    return this.ratingsService.create(userId, createRatingDto);
  }

  // Get all ratings
  @Get()
  getAllRatings() {
    return this.ratingsService.getAllRatings();
  }

  // Get ratings by productId
  @Get('product/:productId')
  findByProduct(@Param('productId') productId: string) {
    return this.ratingsService.findByProduct(productId);
  }

  // Get ratings by userId
  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.ratingsService.findByUser(userId);
  }
}