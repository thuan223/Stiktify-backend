import { Injectable } from '@nestjs/common';
import { CreateShortVideoDto } from './dto/create-short-video.dto';
import { UpdateShortVideoDto } from './dto/update-short-video.dto';
import { TrendingVideoDto } from './dto/trending-video.dto';
import { Video } from './schemas/short-video.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WishlistService } from '../wishlist/wishlist.service';
import { CreateWishListVideoDto } from './dto/create-wishlist-videos.dto';
import { VideoCategoriesService } from '../video-categories/video-categories.service';

@Injectable()
export class ShortVideosService {
  constructor(
    @InjectModel(Video.name)
    private videoModel: Model<Video>,
    private wishListService: WishlistService,
    private videoCategoriesService: VideoCategoriesService,
  ) {}
  create(createShortVideoDto: CreateShortVideoDto) {
    return 'This action adds a new shortVideo';
  }

  findAll() {
    return `This action returns all shortVideos`;
  }

  findOne(id: number) {
    return `This action returns a #${id} shortVideo`;
  }

  update(id: number, updateShortVideoDto: UpdateShortVideoDto) {
    return `This action updates a #${id} shortVideo`;
  }

  remove(id: number) {
    return `This action removes a #${id} shortVideo`;
  }
  async getTrendingVideos(data: TrendingVideoDto) {
    const wishList = await this.wishListService.getWishListByUserId(data);
    const wishListVideoIds = wishList.map((item) => item.videoId);

    let videos = await this.videoModel.find({ _id: { $in: wishListVideoIds } });

    const topVideos = await this.videoModel
      .find({ _id: { $nin: wishListVideoIds } })
      .sort({ totalViews: -1 })
      .limit(10);
    if (topVideos.length > 0) {
      const randomIndex = Math.floor(Math.random() * topVideos.length);
      const randomTopVideo = topVideos[randomIndex];
      videos.push(randomTopVideo);
    }

    const remainingCount = 10 - videos.length;

    if (remainingCount > 0) {
      const randomVideos = await this.videoModel.aggregate([
        {
          $match: {
            _id: { $nin: videos.map((v) => v._id) },
          },
        },
        { $sample: { size: remainingCount } },
      ]);

      videos = [...videos, ...randomVideos];
    }
    await this.wishListService.deleteWishListByUserId(data.userId);
    return videos.map((video) => video.videoDescription);
    // return videos;
  }
  async createWishListVideos(data: CreateWishListVideoDto) {
    const wishList = await this.wishListService.getWishListByUserId(data);

    const categories = wishList.filter(
      (item) => item.wishListType === 'category',
    );
    const creators = wishList.filter((item) => item.wishListType === 'creator');

    const isCategoryComplete = categories.length >= 5;
    const isCreatorComplete = creators.length >= 2;

    if (!isCategoryComplete && !isCreatorComplete) {
      const randomType = Math.random() < 0.5 ? 'category' : 'creator';
      if (randomType === 'category') {
        const randomCategoryVideo = await this.getRandomCategoryVideo(
          data.videoId,
        );
        if (randomCategoryVideo) {
          await this.addVideoToWishList(
            data.userId,
            randomCategoryVideo,
            'category',
          );
        }
        return;
      } else {
        const randomCreatorVideo = await this.getRandomCreatorVideo(
          data.videoId,
        );
        if (randomCreatorVideo) {
          await this.addVideoToWishList(
            data.userId,
            randomCreatorVideo,
            'creator',
          );
        }
      }
      return;
    } else if (!isCategoryComplete) {
      const randomCategoryVideo = await this.getRandomCategoryVideo(
        data.videoId,
      );
      if (randomCategoryVideo) {
        await this.addVideoToWishList(
          data.userId,
          randomCategoryVideo,
          'category',
        );
      }
      return;
    } else if (!isCreatorComplete) {
      const randomCreatorVideo = await this.getRandomCreatorVideo(data.videoId);
      if (randomCreatorVideo) {
        await this.addVideoToWishList(
          data.userId,
          randomCreatorVideo,
          'creator',
        );
      }
      return;
    } else {
      const replaceType = Math.random() < 0.5 ? 'category' : 'creator';

      if (replaceType === 'category') {
        const randomCategoryVideo = await this.getRandomCategoryVideo(
          data.videoId,
        );
        if (randomCategoryVideo) {
          await this.replaceVideoInWishList(
            data.userId,
            randomCategoryVideo,
            'category',
          );
        }
        return;
      } else {
        const randomCreatorVideo = await this.getRandomCreatorVideo(
          data.videoId,
        );
        if (randomCreatorVideo) {
          await this.replaceVideoInWishList(
            data.userId,
            randomCreatorVideo,
            'creator',
          );
        }
        return;
      }
    }
  }
  async getRandomCategoryVideo(videoId: string): Promise<any> {
    const videoCategories =
      await this.videoCategoriesService.getAllCategoryByVideo(videoId);

    if (Array.isArray(videoCategories) && videoCategories.length > 0) {
      const categories = videoCategories.map((category) => category.categoryId);
      if (categories.length > 0) {
        const randomCategory =
          categories[Math.floor(Math.random() * categories.length)];

        const randomCategoryVideo =
          await this.videoCategoriesService.getRandomCategoryVideo(
            randomCategory,
            videoId,
          );

        if (
          Array.isArray(randomCategoryVideo) &&
          randomCategoryVideo.length > 0
        ) {
          return randomCategoryVideo[0].videoId;
        }
      }
    }

    return null;
  }

  async getRandomCreatorVideo(videoId: string): Promise<any> {
    const video = await this.videoModel.findById(videoId);
    if (video) {
      const randomVideo = await this.videoModel.aggregate([
        // { $match: { userId: video.userId, videoId: { $ne: videoId }  } },
        { $match: { userId: video.userId } },
        { $sample: { size: 1 } },
      ]);
      return randomVideo[0] || null;
    }
    return null;
  }
  async addVideoToWishList(userId: string, video: any, wishListType: string) {
    await this.wishListService.addToWishList(userId, video._id, wishListType);
  }

  async replaceVideoInWishList(userId: string, video: any, type: string) {
    const existingWishList = await this.wishListService.getWishListByType(
      userId,
      type,
    );

    if (existingWishList.length > 0) {
      const randomIndex = Math.floor(Math.random() * existingWishList.length);
      const wishListToReplace = existingWishList[randomIndex];
      await this.wishListService.updateWishList(
        userId,
        wishListToReplace.videoId,
        type,
        video._id,
        type,
      );
    }
  }
}
