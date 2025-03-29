import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { CreateWishlistScoreDto } from './dto/create-wishlist-score.dto';
import { UpdateWishlistScoreDto } from './dto/update-wishlist-score.dto';
import { TriggerWishlistScoreDto } from './dto/trigger-wishlist-score';
import { Model } from 'mongoose';
import { WishlistScore } from './schemas/wishlist-score.entity';
import { InjectModel } from '@nestjs/mongoose';
import { ShortVideosService } from '../short-videos/short-videos.service';
import { VideoCategoriesService } from '../video-categories/video-categories.service';
import { SettingsService } from '../settings/settings.service';

@Injectable()
export class WishlistScoreService {
  constructor(
    @InjectModel(WishlistScore.name)
    private wishListScoreModel: Model<WishlistScore>,
    @Inject(forwardRef(() => ShortVideosService))
    private videoService: ShortVideosService,
    @Inject(forwardRef(() => SettingsService))
    private settingsService: SettingsService,
    private videoCategoriesService: VideoCategoriesService,
  ) { }
  create(createWishlistScoreDto: CreateWishlistScoreDto) {
    return 'This action adds a new wishlistScore';
  }
  async triggerWishListScore(triggerWishlistScoreDto: TriggerWishlistScoreDto) {
    let suggest;
    let scoreIncrease = 0;
    const setting = await this.settingsService.findAll();
    const scoreIncreaseSetting = setting.algorithmConfig.scoreIncrease;
    if (triggerWishlistScoreDto.triggerAction === 'WatchVideo') {
      suggest = await this.findSuggestByVideo(triggerWishlistScoreDto.id);
      scoreIncrease = scoreIncreaseSetting.watchVideo;
    } else if (triggerWishlistScoreDto.triggerAction === 'ReactionAboutVideo') {
      suggest = await this.findSuggestByVideo(triggerWishlistScoreDto.id);
      scoreIncrease = scoreIncreaseSetting.reactionAboutVideo;
      suggest.tags = [];
      suggest.musicId = null;
    } else if (triggerWishlistScoreDto.triggerAction === 'ReactionAboutMusic') {
      suggest = await this.findSuggestByVideo(triggerWishlistScoreDto.id);
      scoreIncrease = scoreIncreaseSetting.reactionAboutMusic;
      suggest.tags = [];
      suggest.categoryId = [];
    } else if (triggerWishlistScoreDto.triggerAction === 'ClickLinkMusic') {
      suggest = {
        musicId: triggerWishlistScoreDto.id,
      };
      scoreIncrease = scoreIncreaseSetting.clickLinkMusic;
    } else if (triggerWishlistScoreDto.triggerAction === 'ListenMusic') {
      suggest = {
        musicId: triggerWishlistScoreDto.id,
      };
      scoreIncrease = scoreIncreaseSetting.listenMusic;
    } else if (triggerWishlistScoreDto.triggerAction === 'SearchMusic') {
      suggest = {
        musicId: triggerWishlistScoreDto.id,
      };
      scoreIncrease = scoreIncreaseSetting.searchMusic;
    } else if (triggerWishlistScoreDto.triggerAction === 'CommentVideo') {
      suggest = await this.findSuggestByVideo(triggerWishlistScoreDto.id);
      scoreIncrease = scoreIncreaseSetting.commentVideo;
      suggest.tags = [];
      suggest.musicId = null;
    } else if (triggerWishlistScoreDto.triggerAction === 'ShareVideo') {
      suggest = await this.findSuggestByVideo(triggerWishlistScoreDto.id);
      scoreIncrease = scoreIncreaseSetting.shareVideo;
      suggest.tags = [];
      suggest.musicId = null;
    } else if (triggerWishlistScoreDto.triggerAction === 'FollowCreator') {
      suggest = await this.findSuggestByVideo(triggerWishlistScoreDto.id);
      scoreIncrease = scoreIncreaseSetting.followCreator;
      suggest.tags = [];
      suggest.musicId = null;
      suggest.categoryId = [];
    }
    if (suggest?.tags?.length) {
      for (const tag of suggest.tags) {
        await this.triggerWishListScoretag(
          tag,
          triggerWishlistScoreDto.userId,
          scoreIncrease,
        );
      }
    }
    if (suggest?.musicId) {
      await this.triggerWishListScoreMusic(
        suggest.musicId,
        triggerWishlistScoreDto.userId,
        scoreIncrease,
      );
    }
    if (suggest?.creatorId) {
      await this.triggerWishListScoreCreator(
        suggest.creatorId,
        triggerWishlistScoreDto.userId,
        scoreIncrease,
      );
    }
    if (suggest?.categoryId?.length) {
      for (const category of suggest.categoryId) {
        await this.triggerWishListScoreCategory(
          category,
          triggerWishlistScoreDto.userId,
          scoreIncrease,
        );
      }
    }
    return suggest;
  }
  async triggerWishListScoretag(tag: string, userId: string, scoreBonus) {
    const setting = await this.settingsService.findAll();
    const wishListScoreCount =
      setting.algorithmConfig.numberOfCount.wishListScoreCount;
    await this.videoService.addTagToUser(userId + "", tag + "", scoreBonus);
    const existingTag = await this.wishListScoreModel.findOne({ tag, userId });

    if (existingTag) {
      await this.wishListScoreModel.updateOne(
        { tag, userId },
        { $inc: { score: scoreBonus }, $set: { updatedAt: new Date() } },
      );
    } else {
      const existingWishList = await this.wishListScoreModel
        .find({ userId })
        .sort({ updatedAt: 1 });
      if (existingWishList.length >= wishListScoreCount) {
        const oldestItem = existingWishList[0];
        await this.wishListScoreModel.deleteOne({ _id: oldestItem._id });
      }

      await this.wishListScoreModel.create({
        tag,
        score: scoreBonus,
        userId,
        wishlistType: 'Tag',
        updatedAt: new Date(),
      });
    }
  }

  async triggerWishListScoreMusic(musicId: string, userId: string, scoreBonus) {
    const setting = await this.settingsService.findAll();
    const wishListScoreCount =
      setting.algorithmConfig.numberOfCount.wishListScoreCount;

    const existingMusic = await this.wishListScoreModel.findOne({
      musicId,
      userId,
    });
    await this.videoService.addMusicToUser(userId + "", musicId + "", scoreBonus);
    if (existingMusic) {
      await this.wishListScoreModel.updateOne(
        { musicId, userId },
        { $inc: { score: scoreBonus }, $set: { updatedAt: new Date() } },
      );
    } else {
      const existingWishList = await this.wishListScoreModel
        .find({ userId })
        .sort({ updatedAt: 1 });

      if (existingWishList.length >= wishListScoreCount) {
        const oldestItem = existingWishList[0];
        await this.wishListScoreModel.deleteOne({ _id: oldestItem._id });
      }

      await this.wishListScoreModel.create({
        musicId,
        score: scoreBonus,
        userId,
        wishlistType: 'Music',
        updatedAt: new Date(),
      });
    }
  }

  async triggerWishListScoreCreator(
    creatorId: string,
    userId: string,
    scoreBonus,
  ) {
    const setting = await this.settingsService.findAll();
    const wishListScoreCount =
      setting.algorithmConfig.numberOfCount.wishListScoreCount;
    await this.videoService.addCreatorToUser(userId + "", creatorId + "", scoreBonus);
    const existingCreator = await this.wishListScoreModel.findOne({
      creatorId,
      userId,
    });

    if (existingCreator) {
      await this.wishListScoreModel.updateOne(
        { creatorId, userId },
        { $inc: { score: scoreBonus }, $set: { updatedAt: new Date() } },
      );
    } else {
      const existingWishList = await this.wishListScoreModel
        .find({ userId })
        .sort({ updatedAt: 1 });

      if (existingWishList.length >= wishListScoreCount) {
        const oldestItem = existingWishList[0];
        await this.wishListScoreModel.deleteOne({ _id: oldestItem._id });
      }

      await this.wishListScoreModel.create({
        creatorId,
        score: scoreBonus,
        userId,
        wishlistType: 'Creator',
        updatedAt: new Date(),
      });
    }
  }

  async triggerWishListScoreCategory(
    categoryId: string,
    userId: string,
    scoreBonus,
  ) {
    const setting = await this.settingsService.findAll();
    const wishListScoreCount =
      setting.algorithmConfig.numberOfCount.wishListScoreCount;

    await this.videoService.addCategoryToUser(userId + "", categoryId + "", scoreBonus);

    const existingCategory = await this.wishListScoreModel.findOne({
      categoryId,
      userId,
    });

    if (existingCategory) {
      await this.wishListScoreModel.updateOne(
        { categoryId, userId },
        { $inc: { score: scoreBonus }, $set: { updatedAt: new Date() } },
      );
    } else {
      const existingWishList = await this.wishListScoreModel
        .find({ userId })
        .sort({ updatedAt: 1 });

      if (existingWishList.length >= wishListScoreCount) {
        const oldestItem = existingWishList[0];
        await this.wishListScoreModel.deleteOne({ _id: oldestItem._id });
      }

      await this.wishListScoreModel.create({
        categoryId,
        score: scoreBonus,
        userId,
        wishlistType: 'Category',
        updatedAt: new Date(),
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
  async getScoreByTag(tag: string, userId: string) {
    return await this.wishListScoreModel.findOne({
      tag: tag,
      userId: userId,
      wasCheck: false,
    });
  }
  async getScoreByMusic(musicId: string, userId: string) {
    return await this.wishListScoreModel.findOne({
      musicId: musicId,
      userId: userId,
      wasCheck: false,
    });
  }
  async getScoreByCreator(creatorId: string, userId: string) {
    return await this.wishListScoreModel.findOne({
      creatorId: creatorId,
      userId: userId,
      wasCheck: false,
    });
  }
  async getScoreByCategory(categoryId: string, userId: string) {
    return await this.wishListScoreModel.findOne({
      categoryId: categoryId,
      userId: userId,
      wasCheck: false,
    });
  }
  async checkAndResetWasCheck(userId: string) {
    const totalCount = await this.wishListScoreModel.countDocuments({
      userId: userId,
    });
    const checkedCount = await this.wishListScoreModel.countDocuments({
      userId: userId,
      wasCheck: true,
    });

    if (totalCount > 0 && checkedCount / totalCount > 0.3) {
      return await this.wishListScoreModel.updateMany(
        { userId: userId },
        { $set: { wasCheck: false } },
      );
    }
    return null;
  }
  async findBestVideo(
    wishlistScores: any[],
    scoreChecks: boolean[],
    videoId: string,
    current: number,
    currentGrop: number,
  ) {
    // console.log(wishlistScores)
    // console.log(scoreChecks.every(check => !check))
    if (scoreChecks.every((check) => !check)) return [];
    let suggest = { tags: [], musicID: null, creatorId: null, categoryId: [] };

    for (let n = 0; n < wishlistScores.length; n++) {
      if (scoreChecks[n]) {
        if (wishlistScores[n].wishlistType === 'Tag') {
          suggest.tags.push(wishlistScores[n].tag);
        } else if (wishlistScores[n].wishlistType === 'Music') {
          suggest.musicID = wishlistScores[n].musicId;
        } else if (wishlistScores[n].wishlistType === 'Creator') {
          suggest.creatorId = wishlistScores[n].creatorId;
        } else if (wishlistScores[n].wishlistType === 'Category') {
          suggest.categoryId.push(wishlistScores[n].categoryId);
        }
      }
    }

    const videoListFound = await this.videoService.findVideoBySuggest(
      suggest,
      videoId,
    );
    // console.log(videoListFound);
    if (videoListFound.length > 0) return videoListFound;
    if (scoreChecks.every((check) => check)) {
      scoreChecks[0] = false;
      // console.log(scoreChecks);
      return this.findBestVideo(wishlistScores, scoreChecks, videoId, 0, 1);
    } else {
      const indexLargeFalse = scoreChecks.lastIndexOf(false);
      if (
        !(current == indexLargeFalse && !scoreChecks[scoreChecks.length - 1])
      ) {
        scoreChecks[current] = true;
        scoreChecks[current + 1] = false;
        // console.log(scoreChecks);
        return this.findBestVideo(
          wishlistScores,
          scoreChecks,
          videoId,
          current + 1,
          currentGrop,
        );
      } else {
        const countFalseFromRight = this.countFalseFromRight(scoreChecks);
        if (countFalseFromRight == currentGrop) {
          for (let i = 0; i < currentGrop; i++) {
            scoreChecks[current - i] = true;
          }
          currentGrop += 1;
          current = currentGrop - 1;
          for (let i = 0; i <= current; i++) {
            scoreChecks[i] = false;
          }
          // console.log(scoreChecks);
          return this.findBestVideo(
            wishlistScores,
            scoreChecks,
            videoId,
            current,
            currentGrop,
          );
        } else {
          const smallFalseIndex = scoreChecks.findIndex((val) => val === false);
          scoreChecks[current] = true;
          scoreChecks[smallFalseIndex] = true;
          current = smallFalseIndex + currentGrop;
          for (let i = 1; i <= currentGrop; i++) {
            scoreChecks[smallFalseIndex + i] = false;
          }
          // console.log(scoreChecks);
          return this.findBestVideo(
            wishlistScores,
            scoreChecks,
            videoId,
            current,
            currentGrop,
          );
        }
      }
    }
  }

  countFalseFromRight(arr: boolean[]): number {
    let count = 0;
    for (let i = arr.length - 1; i >= 0; i--) {
      if (arr[i]) break;
      count++;
    }
    return count;
  }

  async updateWasCheckByUserId(_id: string, userId: string) {
    const setting = await this.settingsService.findAll();
    const resetScore = setting.algorithmConfig.resetScore;
    return await this.wishListScoreModel.updateMany(
      { _id: _id, userId: userId },
      {
        $set: { wasCheck: resetScore.wasCheckScore },
        $mul: { score: 1 - resetScore.discountScore / 100 },
      },
    );
  }
  async getAverageCount() {
    const result = await this.wishListScoreModel.aggregate([
      {
        $group: {
          _id: '$userId',
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: null,
          totalCount: { $sum: '$count' },
          totalUsers: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          averageCount: { $divide: ['$totalCount', '$totalUsers'] },
        },
      },
    ]);

    return result.length > 0 ? result[0].averageCount : 0;
  }
  async createGraphDBWatchData(
    userId: string,
    videoId: string,
    suggestByVideo: any,
  ) {
    await this.videoService.watchVideo(userId, videoId + '', 0);
    for (let i = 0; i < suggestByVideo.tags.length; i++) {
      await this.videoService.addTagToVideo(videoId + "", suggestByVideo.tags[i], 0);
    }
    if (suggestByVideo.musicId)
      await this.videoService.addMusicToVideo(videoId + "", suggestByVideo.musicId + "", 0);

    console.log(suggestByVideo.categoryId);
    for (let i = 0; i < suggestByVideo.categoryId.length; i++) {
      await this.videoService.addCategoryToVideo(videoId + "", suggestByVideo.categoryId[i] + "", 0);
    }
    await this.videoService.addCreatorToVideo(videoId + "", suggestByVideo.creatorId + "", 0);
    console.log(await this.videoService.getVideoDetails(videoId + ""));
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
