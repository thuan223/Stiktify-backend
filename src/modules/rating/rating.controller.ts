import { 
    Controller, 
    Post, 
    Body, 
    Req, 
    UseGuards, 
    Param 
  } from '@nestjs/common';
  import { RatingService } from './rating.service';
  import { CreateRatingDto } from './dto/create-rating.dto';
  import { Request } from 'express';
import { JwtAuthGuard } from '@/auth/passport/jwt-auth.guard';
  
  @Controller('rating')
  export class RatingController {
    constructor(private readonly ratingService: RatingService) {}
  
    @Post(':orderId/rate')
    @UseGuards(JwtAuthGuard)
    async rateOrder(
      @Param('orderId') orderId: string,
      @Body() createRatingDto: CreateRatingDto,
      @Req() req: Request
    ) {
      // @ts-ignore
      const userId = req.user.id;
      
      return this.ratingService.createRating({
        ...createRatingDto,
        orderId,
        userId
      });
    }
  }