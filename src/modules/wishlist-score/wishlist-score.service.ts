import { forwardRef, Inject, Injectable } from '@nestjs/common';
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
        @Inject(forwardRef(() => ShortVideosService)) 
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
      await  this.triggerWishListScoretag(tag, triggerWishlistScoreDto.userId, scoreIncrase);
      }
    }
    if (suggest?.musicId) {
    await  this.triggerWishListScoreMusic(
        suggest.musicId,
        triggerWishlistScoreDto.userId,
        scoreIncrase,
      );
    }
    if (suggest?.creatorId) {
     await this.triggerWishListScoreCreator(
        suggest.creatorId,
        triggerWishlistScoreDto.userId,
        scoreIncrase,
      );
    }
    if (suggest?.categoryId?.length) {
      for (const category of suggest.categoryId) {
     await   this.triggerWishListScoreCategory(
          category,
          triggerWishlistScoreDto.userId,
          scoreIncrase,
        );
      }
    }
    return suggest;
  }
  async triggerWishListScoretag(tag: string, userId: string, scoreBonus) {
    const existingTag = await this.wishListScoreModel.findOne({ tag,userId });
    if (existingTag) {
      await this.wishListScoreModel.updateOne(
        { tag,userId },
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
    const existingTag = await this.wishListScoreModel.findOne({ musicId,userId });
    if (existingTag) {
      await this.wishListScoreModel.updateOne(
        { musicId,userId },
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
    const existingTag = await this.wishListScoreModel.findOne({ creatorId,userId });
    if (existingTag) {
      await this.wishListScoreModel.updateOne(
        { creatorId,userId },
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
    const existingTag = await this.wishListScoreModel.findOne({ categoryId,userId });
    if (existingTag) {
      await this.wishListScoreModel.updateOne(
        { categoryId,userId },
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
  async getScoreByTag(tag:string,userId:string){
    return await this.wishListScoreModel.findOne({tag:tag,userId:userId, wasCheck:false})
  }
  async getScoreByMusic(musicId:string,userId:string){
    return await this.wishListScoreModel.findOne({musicId:musicId,userId:userId, wasCheck:false})
  }
  async getScoreByCreator(creatorId:string,userId:string){
    return await this.wishListScoreModel.findOne({creatorId:creatorId,userId:userId, wasCheck:false})
  }
  async getScoreByCategory(categoryId:string,userId:string){
    return await this.wishListScoreModel.findOne({categoryId:categoryId,userId:userId, wasCheck:false})
  }
  async checkAndResetWasCheck(userId: string) {
    const totalCount = await this.wishListScoreModel.countDocuments({ userId: userId });
    const checkedCount = await this.wishListScoreModel.countDocuments({ userId: userId, wasCheck: true });

    
    if (totalCount > 0 && checkedCount / totalCount > 0.3) {
      console.log("totalCount");
     return await this.wishListScoreModel.updateMany(
        { userId: userId },
        { $set: { wasCheck: false } }
      );
    }
    return null;
  }
  
  async updateWasCheckByUserId(_id: string, userId: string) {
    return await this.wishListScoreModel.updateMany(
      { _id: _id, userId: userId },
      {
        $set: { wasCheck: true },
        $mul: { score: 0.9 },
      }
    );
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
