import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { TrendingVideoDto } from '../short-videos/dto/trending-video.dto';
import { WishList } from './schemas/wishlist.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { WishlistScoreService } from '../wishlist-score/wishlist-score.service';
import { ViewinghistoryService } from '../viewinghistory/viewinghistory.service';

@Injectable()
export class WishlistService {
  constructor(
    @InjectModel(WishList.name)
    private wishListModel: Model<WishList>,
    @Inject(forwardRef(() => WishlistScoreService))
    private wishListScoreService: WishlistScoreService,
    private viewingHistoryService: ViewinghistoryService,
  ) { }
  async create(createWishlistDto: CreateWishlistDto) {
    let suggestByVideo;
    console.log(createWishlistDto.id);
    if (createWishlistDto.triggerAction != 'ScrollVideo') {
      await this.wishListScoreService.triggerWishListScore(createWishlistDto);
    }
    suggestByVideo = await this.wishListScoreService.findSuggestByVideo(
      createWishlistDto.id,
    );

    if (suggestByVideo) {
      const wishListScores = await this.getScoreBySuggestIDAndType(
        suggestByVideo,
        createWishlistDto.userId,
      );
      let scoreChecks = [];
      for (let n = 0; n < wishListScores.length; n++) {
        scoreChecks[n] = true;
      }
      // Sắp xếp wishlistScores theo score tăng dần
      wishListScores.sort((a, b) => a.score - b.score);
      const videoFound = await this.wishListScoreService.findBestVideo(
        wishListScores,
        scoreChecks,
        createWishlistDto.id,
        -1,0
      );
      if (videoFound.length === 1) {
        return await this.createWishListVideo(
          videoFound[0]._id,
          createWishlistDto.userId,
        );
      } else if (videoFound.length == 0) {
        return { message: 'Not found any video suggest!' };
      }
      const bestVideo = await this.getTheBestChoiceFromListVideo(
        videoFound,
        createWishlistDto.userId,
      );
      return await this.createWishListVideo(
        bestVideo._id,
        createWishlistDto.userId,
      );
    }
    return null;
  }
  async getTheBestChoiceFromListVideo(videoList: any, userId: string) {
    let filteredList = [];
    for (const video of videoList) {
      if (
        !(await this.viewingHistoryService.findByVideoId(video._id, userId))
      ) {
        filteredList.push(video);
      }
    }

    videoList = filteredList.length > 0 ? filteredList : videoList;
    filteredList = [];
    for (const video of videoList) {
      if (!(await this.findByVideoId(video._id, userId))) {
        filteredList.push(video);
      }
    }
    videoList = filteredList.length > 0 ? filteredList : videoList;
    if (videoList.length === 1) {
      return videoList[0];
    }

    let maxScore = 0;
    let maxScoreVideo: any[] = [];

    for (const video of videoList) {
      let currentScore = 0;
      const videoSuggest = await this.wishListScoreService.findSuggestByVideo(
        video._id,
      );

      if (videoSuggest.tags) {
        for (const tag of videoSuggest.tags) {
          const score = await this.wishListScoreService.getScoreByTag(
            tag,
            userId,
          );
          if (score) currentScore += score.score;
        }
      }
      if (videoSuggest.categoryId) {
        for (const category of videoSuggest.categoryId) {
          const score = await this.wishListScoreService.getScoreByCategory(
            category,
            userId,
          );
          if (score) currentScore += score.score;
        }
      }
      if (videoSuggest.musicId) {
        const score = await this.wishListScoreService.getScoreByMusic(
          videoSuggest.musicId,
          userId,
        );
        if (score) currentScore += score.score;
      }
      if (videoSuggest.creatorId) {
        const score = await this.wishListScoreService.getScoreByCreator(
          videoSuggest.creatorId,
          userId,
        );
        if (score) currentScore += score.score;
      }

      if (currentScore > maxScore) {
        maxScore = currentScore;
        maxScoreVideo = [video]; // Gán lại danh sách mới
      } else if (currentScore === maxScore) {
        maxScoreVideo.push(video);
      }
    }

    if (maxScoreVideo.length === 1) {
      return maxScoreVideo[0];
    }

    const bestVideo = maxScoreVideo.reduce(
      (max, video) => (video.totalViews > max.totalViews ? video : max),
      maxScoreVideo[0] || { totalViews: 0 },
    );

    return bestVideo;
  }

  async createWishListVideo(videoId: string, userId: string) {
    const existingWishListItem = await this.wishListModel.findOne({
      userId: userId,
      videoId: videoId,
    });

    if (!existingWishListItem) {
      const newWishListItem = new this.wishListModel({
        userId: userId,
        videoId: videoId,
      });

      return await newWishListItem.save();
    } else {
      return { message: 'Wishlist item already exists' };
    }
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
  async findByVideoId(videoId: string, userId: string) {
    return await this.wishListModel.findOne({ videoId, userId });
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
    return await this.wishListModel.find({ userId: data.userId }).limit(8);
  }
  async deleteWishListByUserId(userId: string): Promise<any> {
    const result = await this.wishListModel.deleteMany({ userId });
    return {
      acknowledged: result.acknowledged,
      deletedCount: result.deletedCount,
    };
  }
}
