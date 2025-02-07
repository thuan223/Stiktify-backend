import { PartialType } from '@nestjs/mapped-types';
import { CreateWishlistScoreDto } from './create-wishlist-score.dto';

export class UpdateWishlistScoreDto extends PartialType(CreateWishlistScoreDto) {}
