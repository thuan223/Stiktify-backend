import { Injectable } from '@nestjs/common';
import { CreateWishlistScoreDto } from './dto/create-wishlist-score.dto';
import { UpdateWishlistScoreDto } from './dto/update-wishlist-score.dto';
import { TriggerWishlistScoreDto } from './dto/trigger-wishlist-score';
import { Model } from 'mongoose';
import { WishlistScore } from './schemas/wishlist-score.entity';
import { InjectModel } from '@nestjs/mongoose';
import { ShortVideosService } from '../short-videos/short-videos.service';
import { VideoCategoriesService } from '../video-categories/video-categories.service';

@Injectable()
export class WishlistScoreService {
  constructor(
    @InjectModel(WishlistScore.name)
    private wishListScoreModel: Model<WishlistScore>,
    private videoService: ShortVideosService,
    private videoCategoriesService: VideoCategoriesService,
  ) {}
  create(createWishlistScoreDto: CreateWishlistScoreDto) {
    return 'This action adds a new wishlistScore';
  }
  async triggerWishListScore(triggerWishlistScoreDto: TriggerWishlistScoreDto) {
    let suggest;
    let scoreIncrase = 0;
    if (triggerWishlistScoreDto.triggerAction === 'WatchVideo') {
      suggest = await this.findSuggestByVideo(triggerWishlistScoreDto.id);
      scoreIncrase = 1;
    } else if (triggerWishlistScoreDto.triggerAction === 'ReactionAboutVideo') {
      suggest = await this.findSuggestByVideo(triggerWishlistScoreDto.id);
      scoreIncrase = 1.5;
      suggest.tags = [];
      suggest.musicId = null;
    } else if (triggerWishlistScoreDto.triggerAction === 'ReactionAboutMusic') {
      suggest = await this.findSuggestByVideo(triggerWishlistScoreDto.id);
      scoreIncrase = 1.5;
      suggest.tags = [];
      suggest.categoryId = [];
    } else if (triggerWishlistScoreDto.triggerAction === 'ClickLinkMusic') {
      suggest = {
        musicId: triggerWishlistScoreDto.id,
      };
      scoreIncrase = 2.5;
    }else if (triggerWishlistScoreDto.triggerAction === 'CommentVideo') {
      suggest = await this.findSuggestByVideo(triggerWishlistScoreDto.id);
      scoreIncrase = 1.5;
      suggest.tags = [];
      suggest.musicId = null;
    } else if (triggerWishlistScoreDto.triggerAction === 'ShareVideo') {
      suggest = await this.findSuggestByVideo(triggerWishlistScoreDto.id);
      scoreIncrase =2;
      suggest.tags = [];
      suggest.musicId = null;
    }
    if (suggest?.tags?.length) {
      for (const tag of suggest.tags) {
        this.triggerWishListScoretag(tag, triggerWishlistScoreDto.userId, scoreIncrase);
      }
    }
    if (suggest?.musicId) {
      this.triggerWishListScoreMusic(
        suggest.musicId,
        triggerWishlistScoreDto.userId,
        scoreIncrase,
      );
    }
    if (suggest?.creatorId) {
      this.triggerWishListScoreCreator(
        suggest.creatorId,
        triggerWishlistScoreDto.userId,
        scoreIncrase,
      );
    }
    if (suggest?.categoryId?.length) {
      for (const category of suggest.categoryId) {
        this.triggerWishListScoreCategory(
          category,
          triggerWishlistScoreDto.userId,
          scoreIncrase,
        );
      }
    }
    return suggest;
  }
  async triggerWishListScoretag(tag: string, userId: string, scoreBonus) {
    const existingTag = await this.wishListScoreModel.findOne({ tag });
    if (existingTag) {
      await this.wishListScoreModel.updateOne(
        { tag },
        { $inc: { score: scoreBonus } },
      );
    } else {
      await this.wishListScoreModel.create({
        tag,
        score: scoreBonus,
        userId: userId,
        wishlistType: 'Tag',
      });
    }
  }
  async triggerWishListScoreMusic(musicId: string, userId: string, scoreBonus) {
    const existingTag = await this.wishListScoreModel.findOne({ musicId });
    if (existingTag) {
      await this.wishListScoreModel.updateOne(
        { musicId },
        { $inc: { score: scoreBonus } },
      );
    } else {
      await this.wishListScoreModel.create({
        musicId,
        score: scoreBonus,
        userId: userId,
        wishlistType: 'Music',
      });
    }
  }
  async triggerWishListScoreCreator(
    creatorId: string,
    userId: string,
    scoreBonus,
  ) {
    const existingTag = await this.wishListScoreModel.findOne({ creatorId });
    if (existingTag) {
      await this.wishListScoreModel.updateOne(
        { creatorId },
        { $inc: { score: scoreBonus } },
      );
    } else {
      await this.wishListScoreModel.create({
        creatorId,
        score: scoreBonus,
        userId: userId,
        wishlistType: 'Creator',
      });
    }
  }
  async triggerWishListScoreCategory(
    categoryId: string,
    userId: string,
    scoreBonus,
  ) {
    const existingTag = await this.wishListScoreModel.findOne({ categoryId });
    if (existingTag) {
      await this.wishListScoreModel.updateOne(
        { categoryId },
        { $inc: { score: scoreBonus } },
      );
    } else {
      await this.wishListScoreModel.create({
        categoryId,
        score: scoreBonus,
        userId: userId,
        wishlistType: 'Category',
      });
    }
  }
  async findSuggestByVideo(videoId: string) {
    let suggest = { tags: [], musicId: null, creatorId: null, categoryId: [] };
    const video = await this.videoService.findVideoById(videoId);
    console.log(video._id);
    if (video) {
      suggest.tags = video.videoTag || [];
      suggest.musicId = video.musicId || null;
      suggest.creatorId = video.userId || null;
    }
    const videoCategories =
      await this.videoCategoriesService.findVideoCategoriesById(videoId);
    if (Array.isArray(videoCategories)) {
      suggest.categoryId = videoCategories.map((item) => item.categoryId);
    }
    return suggest;
  }
  findAll() {
    return `This action returns all wishlistScore`;
  }

  findOne(id: number) {
    return `This action returns a #${id} wishlistScore`;
  }

  update(id: number, updateWishlistScoreDto: UpdateWishlistScoreDto) {
    return `This action updates a #${id} wishlistScore`;
  }

  remove(id: number) {
    return `This action removes a #${id} wishlistScore`;
  }
}
