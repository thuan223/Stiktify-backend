import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { TrendingVideoDto } from '../short-videos/dto/trending-video.dto';
import { WishList } from './schemas/wishlist.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { WishlistScoreService } from '../wishlist-score/wishlist-score.service';

@Injectable()
export class WishlistService {
  constructor(
    @InjectModel(WishList.name)
    private wishListModel: Model<WishList>,
    @Inject(forwardRef(() => WishlistScoreService))
    private wishListScoreService: WishlistScoreService,
  ) {}
  async create(createWishlistDto: CreateWishlistDto) {
    console.log(createWishlistDto);
    let suggestByVideo;
    if (createWishlistDto.triggerAction != 'ScrollVideo') {
      suggestByVideo =
        await this.wishListScoreService.triggerWishListScore(createWishlistDto);
    } else {
      suggestByVideo = await this.wishListScoreService.findSuggestByVideo(
        createWishlistDto.id,
      );
    }
    if (suggestByVideo) {
      const wishListScore = await this.getScoreBySuggestIDAndType(
        suggestByVideo,
        createWishlistDto.userId,
      );
      return wishListScore;
    }
    return null;
  }
  async getScoreBySuggestIDAndType(
    suggestByVideo: {
      tags: string[];
      musicId: string;
      creatorId: string;
      categoryId: string[];
    },
    userId: string,
  ) {
    await this.wishListScoreService.checkAndResetWasCheck(userId);
    let wishListScores = [];
    console.log(suggestByVideo);
    if (suggestByVideo.tags) {
      for (const tag of suggestByVideo.tags) {
        const tagScore = await this.wishListScoreService.getScoreByTag(
          tag,
          userId,
        );
        if (tagScore) wishListScores.push(tagScore);
      }
    }
    if (suggestByVideo.musicId) {
      const musicScore = await this.wishListScoreService.getScoreByMusic(
        suggestByVideo.musicId,
        userId,
      );
      if (musicScore) wishListScores.push(musicScore);
    }
    if (suggestByVideo.creatorId) {
      const creatorScore = await this.wishListScoreService.getScoreByCreator(
        suggestByVideo.creatorId,
        userId,
      );
      if (creatorScore) wishListScores.push(creatorScore);
    }
    if (suggestByVideo.categoryId) {
      for (const cateId of suggestByVideo.categoryId) {
        const cateScore = await this.wishListScoreService.getScoreByCategory(
          cateId,
          userId,
        );
        if (cateScore) wishListScores.push(cateScore);
      }
    }

    for (const wishListScore of wishListScores) {
      await this.wishListScoreService.updateWasCheckByUserId(
        wishListScore._id,
        userId,
      );
    }
    return wishListScores;
  }
  findAll() {
    return `This action returns all wishlist`;
  }

  findOne(id: number) {
    return `This action returns a #${id} wishlist`;
  }

  update(id: number, updateWishlistDto: UpdateWishlistDto) {
    return `This action updates a #${id} wishlist`;
  }

  remove(id: number) {
    return `This action removes a #${id} wishlist`;
  }
  async getWishListByUserId(data: TrendingVideoDto) {
    return await this.wishListModel.find({ userId: data.userId });
  }
  async deleteWishListByUserId(userId: string): Promise<any> {
    const result = await this.wishListModel.deleteMany({ userId });
    return {
      acknowledged: result.acknowledged,
      deletedCount: result.deletedCount,
    };
  }

  async addToWishList(
    userId: string,
    videoId: string,
    wishListType: string,
  ): Promise<any> {
    const existingItem = await this.wishListModel.findOne({
      userId,
      videoId,
      wishListType,
    });
    if (existingItem) {
      throw new Error('Video already exists in the wish list');
    }

    const newWishListItem = new this.wishListModel({
      userId,
      videoId,
      wishListType,
    });

    return await newWishListItem.save();
  }
  async getWishListByType(userId: string, type: string): Promise<any[]> {
    return await this.wishListModel
      .find({ userId, wishListType: type })
      .populate('videoId');
  }
  async updateWishList(
    userId: string,
    videoId: string,
    type: string,
    newVideoId: any,
    newType: string,
  ): Promise<any> {
    const wishListItem = await this.wishListModel.findOne({
      userId,
      videoId,
      wishListType: type,
    });
    if (!wishListItem) {
      throw new Error('Item not found in the wish list');
    }
    const existingItem = await this.wishListModel.findOne({
      userId,
      videoId: newVideoId,
      wishListType: newType,
    });
    if (existingItem) {
      throw new Error('Video already exists in the wish list');
    }
    wishListItem.videoId = newVideoId;
    wishListItem.wishListType = newType;
    Object.assign(wishListItem, newVideoId, newType);
    return await wishListItem.save();
  }
}
