import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { WishlistScoreService } from './wishlist-score.service';
import { CreateWishlistScoreDto } from './dto/create-wishlist-score.dto';
import { UpdateWishlistScoreDto } from './dto/update-wishlist-score.dto';
import { TriggerWishlistScoreDto } from './dto/trigger-wishlist-score';

@Controller('wishlist-score')
export class WishlistScoreController {
  constructor(private readonly wishlistScoreService: WishlistScoreService) {}

  @Post()
  create(@Body() createWishlistScoreDto: CreateWishlistScoreDto) {
    return this.wishlistScoreService.create(createWishlistScoreDto);
  }
  @Post('trigger-wishlist-score')
  triggerWishListScore(@Body() triggerWishlistScoreDto: TriggerWishlistScoreDto) {
    return this.wishlistScoreService.triggerWishListScore(triggerWishlistScoreDto);
  }

  @Get()
  findAll() {
    return this.wishlistScoreService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.wishlistScoreService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateWishlistScoreDto: UpdateWishlistScoreDto) {
    return this.wishlistScoreService.update(+id, updateWishlistScoreDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.wishlistScoreService.remove(+id);
  }
}
