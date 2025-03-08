import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Setting } from './schemas/schema.entity';
import { Model } from 'mongoose';
import { WishlistScoreService } from '../wishlist-score/wishlist-score.service';
import { WishlistService } from '../wishlist/wishlist.service';

@Injectable()
export class SettingsService {
  constructor(
    @InjectModel(Setting.name)
    private settingModel: Model<Setting>,
    @Inject(forwardRef(() => WishlistScoreService))
    private wishListScoreService: WishlistScoreService,
    @Inject(forwardRef(() => WishlistService))
    private wishListService: WishlistService,
  ) {}
  create(createSettingDto: CreateSettingDto) {
    return 'This action adds a new setting';
  }

  async findAll() {
    const setting = (await this.settingModel.find()).at(0);
    const averageWishListScore =
      await this.wishListScoreService.getAverageCount();
    const averageWishList = await this.wishListService.getAverageCount();
    return {
      algorithmConfig: setting,
      averageWishListScore: averageWishListScore,
      averageWishList: averageWishList,
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} setting`;
  }

  async update(updateSettingDto: UpdateSettingDto) {
    return this.settingModel.findOneAndUpdate({}, updateSettingDto, {
      new: true,
      upsert: true,
    });
  }

  remove(id: number) {
    return `This action removes a #${id} setting`;
  }
}
