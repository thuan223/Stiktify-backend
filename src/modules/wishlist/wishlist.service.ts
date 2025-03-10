import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { TrendingVideoDto } from '../short-videos/dto/trending-video.dto';
import { WishList } from './schemas/wishlist.entity';
import { Model, ObjectId } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { WishlistScoreService } from '../wishlist-score/wishlist-score.service';
import { ViewinghistoryService } from '../viewinghistory/viewinghistory.service';
import { SettingsService } from '../settings/settings.service';

@Injectable()
export class WishlistService {
  constructor(
    @InjectModel(WishList.name)
    private wishListModel: Model<WishList>,
    @Inject(forwardRef(() => WishlistScoreService))
    private wishListScoreService: WishlistScoreService,
    @Inject(forwardRef(() => SettingsService))
    private settingsService:SettingsService,
    private viewingHistoryService: ViewinghistoryService,
  ) {}
  async create(createWishlistDto: CreateWishlistDto) {
    let suggestByVideo;
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
        -1,
        0,
      );
      if (videoFound.length === 1) {
        return await this.createWishListVideo(
          suggestByVideo,
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
        suggestByVideo,
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

  async createWishListVideo( suggestByVideo:any,videoId: string, userId: string) {
    await this.wishListScoreService.createGraphDBWatchData(userId, videoId,suggestByVideo);
    const setting = await this.settingsService.findAll();
    const wishListCount = setting.algorithmConfig.numberOfCount.wishListCount;
    
    const existingWishListItem = await this.wishListModel.findOne({
      userId: userId,
      videoId: videoId,
    });
    
    if (existingWishListItem) {
        return { message: 'Wishlist item already exists' };
    }
    const existingWishList = await this.wishListModel.find({ userId }).sort({ createdAt: 1 });
    if (existingWishList.length >= wishListCount) {
        const oldestItem = existingWishList[0];
        await this.wishListModel.deleteOne({ _id: oldestItem._id });
    }
    
    const newWishListItem = new this.wishListModel({ userId, videoId });
    return await newWishListItem.save();
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
  async getWishListByUserId(data: TrendingVideoDto, limit: number) {
    return await this.wishListModel.find({ userId: data.userId }).limit(limit);
  }
  async deleteWishListByUserId(userId: string): Promise<any> {
    const result = await this.wishListModel.deleteMany({ userId });
    return {
      acknowledged: result.acknowledged,
      deletedCount: result.deletedCount,
    };
  }
  async getCollaboratorList(userId: string) {
    const userWishLists = await this.wishListModel.find({ userId });
    if (!userWishLists.length) return [];
    const setting = await this.settingsService.findAll();
    const collaborativeFiltering = setting.algorithmConfig.collaborativeFiltering;
    const userVideoIds = userWishLists.map((wishlist) => wishlist.videoId);

    const collaboratorList = await this.wishListModel.aggregate([
      {
        $match: {
          userId: { $ne: userId },
        },
      },
      {
        $group: {
          _id: '$userId',
          videoIds: { $push: '$videoId' },
        },
      },
      {
        $project: {
          userId: '$_id',
          commonVideos: {
            $size: {
              $setIntersection: [userVideoIds, '$videoIds'],
            },
          },
        },
      },
      {
        $match: {
          commonVideos: { $gte: collaborativeFiltering.numberWishListVideo },
        },
      },
      {
        $sort: { commonVideos: -1 },
      },
      {
        $limit: collaborativeFiltering.numberCollaborator,
      },
    ]);

    const filteredCollaborators = collaboratorList.map((user) => user.userId);

    return [userVideoIds, filteredCollaborators];
  }
  async getTheGeneralWishlist(userId: string) {
    const returnData = await this.getCollaboratorList(userId);
    const collaboratorList: string[] = returnData[1] || [];

    // const userVideoIds = new Set<string>(
    //   (returnData[0] || []).map((id) => id.toString()),
    // );

    let videoIdFound: Set<string> = new Set();

    for (const collaboratorId of collaboratorList) {
      const collaboratorWishlists = await this.wishListModel.find({
        userId: collaboratorId,
      });

      for (const wishlist of collaboratorWishlists) {
        const videoId = wishlist.videoId.toString();

        // if (!userVideoIds.has(videoId)) {
          videoIdFound.add(videoId);
        // }
      }
    }

    return [Array.from(videoIdFound), collaboratorList];
  }
  async getPredictedScores(userId: string) {
    const returnData = await this.getTheGeneralWishlist(userId);
    const generalWishList = returnData[0];
    const collaboratorList = returnData[1];
    const userWishListScores = new Map<string, number>();

    await Promise.all(
      generalWishList.map(async (item) => {
        const suggestVideo =
          await this.wishListScoreService.findSuggestByVideo(item);
        const scores = await this.getScoreBySuggestIDAndType(
          suggestVideo,
          userId,
        );
        const totalScore = scores.reduce((sum, s) => sum + (s.score || 0), 0);
        userWishListScores.set(item, totalScore);
      }),
    );

    const validCollaborators = collaboratorList.filter(
      (collaboratorId) => collaboratorId + '' !== userId,
    );

    const collaboratorScores = await Promise.all(
      validCollaborators.map(async (collaboratorId) => {
        const wishListScores = new Map<string, number>();

        await Promise.all(
          generalWishList.map(async (item) => {
            const suggestVideo =
              await this.wishListScoreService.findSuggestByVideo(item);
            const scores = await this.getScoreBySuggestIDAndType(
              suggestVideo,
              collaboratorId,
            );
            const totalScore = scores.reduce(
              (sum, s) => sum + (s.score || 0),
              0,
            );
            wishListScores.set(item, totalScore);
          }),
        );

        return { collaboratorId, wishListScores };
      }),
    );

    function cosineSimilarity(
      mapA: Map<string, number>,
      mapB: Map<string, number>,
    ): number {
      let dotProduct = 0,
        normA = 0,
        normB = 0;

      for (const [key, scoreA] of mapA.entries()) {
        const scoreB = mapB.get(key) || 0;
        dotProduct += scoreA * scoreB;
        normA += scoreA ** 2;
        normB += scoreB ** 2;
      }

      return normA && normB
        ? dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
        : 0;
    }

    const collaboratorSimilarities = collaboratorScores.map(
      ({ collaboratorId, wishListScores }) => ({
        collaboratorId,
        similarity: cosineSimilarity(userWishListScores, wishListScores),
        wishListScores,
      }),
    );

    const predictedScores = new Map<string, number>();

    for (const video of generalWishList) {
      let numerator = 0;
      let denominator = 0;

      for (const { similarity, wishListScores } of collaboratorSimilarities) {
        const collaboratorScore = wishListScores.get(video) || 0;
        numerator += similarity * collaboratorScore;
        denominator += Math.abs(similarity);
      }

      predictedScores.set(video, denominator ? numerator / denominator : 0);
    }

    return Object.fromEntries(predictedScores);
  }
  async getCollaborativeVideo(userId: string, numberChooseVideo: number = 1) {
    const userWishListData = await this.wishListModel.find({ userId });
    const userWishList = new Set(userWishListData.map((item) => item.videoId+""));

    const predictedScores = await this.getPredictedScores(userId);
    const filteredVideos = Object.entries(predictedScores) 
      .filter(([videoId]) => !userWishList.has(videoId))
      .sort((a, b) => b[1] - a[1]) 
      .slice(0, numberChooseVideo)
      .map(([videoId]) => videoId); 

    return filteredVideos;
  }
  async getAverageCount() {
    const result = await this.wishListModel.aggregate([
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
}
