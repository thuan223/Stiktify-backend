import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateShortVideoDto } from './dto/create-short-video.dto';
import { UpdateShortVideoDto } from './dto/update-short-video.dto';
import { TrendingVideoDto } from './dto/trending-video.dto';
import { Video } from './schemas/short-video.schema';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { WishlistService } from '../wishlist/wishlist.service';
import { CreateWishListVideoDto } from './dto/create-wishlist-videos.dto';
import { VideoCategoriesService } from '../video-categories/video-categories.service';
import aqp from 'api-query-params';
import { CategoriesService } from '../categories/categories.service';
import { User } from '../users/schemas/user.schema';



@Injectable()
export class ShortVideosService {
  constructor(
    @InjectModel(Video.name)
    private videoModel: Model<Video>,
    @InjectModel(User.name) private userModel: Model<User>,
    private wishListService: WishlistService,
    private videoCategoriesService: VideoCategoriesService,
    private categoriesService: CategoriesService,
  ) { }



  create(createShortVideoDto: CreateShortVideoDto) {
    return 'This action adds a new shortVideo';
  }

  async findAll(query: string, current: number, pageSize: number) {
    try {
      const { filter, sort } = aqp(query);

      if (filter.current) delete filter.current;
      if (filter.pageSize) delete filter.pageSize;

      if (!current) current = 1;
      if (!pageSize) pageSize = 10;

      //Tính tổng số lượng
      const totalItems = (await this.videoModel.find(filter)).length;
      //Tính tổng số trang
      const totalPages = Math.ceil(totalItems / pageSize);

      const skip = (+current - 1) * +pageSize;

      const result = await this.videoModel
        .find(filter)
        .limit(pageSize)
        .skip(skip)
        .select('-password')
        .sort(sort as any)
        .populate("userId", 'userName')

      return {
        meta: {
          current: current, // trang hien tai
          pageSize: pageSize, // so luong ban ghi
          pages: totalPages, // tong so trang voi dieu kien query
          total: totalItems, // tong so ban ghi
        },
        result: result,
      }
    } catch (error) {
      console.log(error);
      return null
    }
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
  async getTrendingVideosByUser(data: TrendingVideoDto) {
    const wishList = await this.wishListService.getWishListByUserId(data);
    const wishListVideoIds = wishList.map((item) => item.videoId);

    let videos = await this.videoModel.find({ _id: { $in: wishListVideoIds } }).populate('userId');
    const topVideos = await this.videoModel
      .find({ _id: { $nin: wishListVideoIds } })
      .sort({ totalViews: -1 })
      .limit(10).populate('userId');
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
      const populatedVideos = await this.videoModel.populate(randomVideos, [
        { path: "userId" },
      ]);
      videos = [...videos, ...populatedVideos];
    }

    await this.wishListService.deleteWishListByUserId(data.userId);
    // return videos.map((video) => video.videoDescription);
    return videos;
  }
  async getTrendingVideosByGuest() {
    let videos = [];
    const remainingCount = 10;

    if (remainingCount > 0) {
      const randomVideos = await this.videoModel.aggregate([
        { $sample: { size: remainingCount } },
      ]);
      const populatedVideos = await this.videoModel.populate(randomVideos, [
        { path: "userId" },
      ]);
      videos = [...videos, ...populatedVideos];
    }
    // return videos.map((video) => video.videoDescription);
    return videos;
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
        return { statusCode: 201, message: "Create WishList" };
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
      return { statusCode: 201, message: "Create WishList" };
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
      return { statusCode: 201, message: "Create WishList" };
    } else if (!isCreatorComplete) {
      const randomCreatorVideo = await this.getRandomCreatorVideo(data.videoId);
      if (randomCreatorVideo) {
        await this.addVideoToWishList(
          data.userId,
          randomCreatorVideo,
          'creator',
        );
      }
      return { statusCode: 201, message: "Create WishList" };
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
        return { statusCode: 201, message: "Create WishList" };
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
        return { statusCode: 201, message: "Create WishList" };
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
  async isIdExist(id: string) {
    try {
      const result = await this.videoModel.exists({ _id: id });
      if (result) return true;
      return false;
    } catch (error) {
      return false;
    }
  }

  async handleFlagVideo(_id: string, flag: boolean) {
    const checkId = await this.isIdExist(_id)
    if (checkId === false) {
      throw new BadRequestException(`Short video not found with ID: ${_id}`);
    } else {
      const result = await this.videoModel.findByIdAndUpdate(_id, { flag: flag })
      return result._id
    }
  }

  async ViewUserVideos(userId: string, current: number, pageSize: number) {
    const filter = { userId: new mongoose.Types.ObjectId(userId) };
    const totalItems = await this.videoModel.countDocuments(filter);
    if (totalItems === 0) {
      return {
        meta: {
          current,
          pageSize,
          totalItems: 0,
          totalPages: 0,
        },
        result: [],
        message: 'No videos found for this user',
      };
    }
    const skip = (current - 1) * pageSize;
    const result = await this.videoModel
      .find(filter)
      .skip(skip)
      .limit(pageSize)
      .sort({ createdAt: -1 })
      .select('videoUrl totalFavorite totalReaction totalViews videoDescription')

    return {
      meta: {
        current,
        pageSize,
        totalItems,
        totalPages: Math.ceil(totalItems / pageSize),
      },
      result,
    };
  }
 async findVideoById(videoId:string){
    return await this.videoModel.findById(videoId);
  }

  async searchVideosByDescription(searchText: string, current: number, pageSize: number) {
    const regex = new RegExp(searchText, 'i');
    const filter = { videoDescription: { $regex: regex } };
    const totalItems = await this.videoModel.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / pageSize);
    const skip = (current - 1) * pageSize;
    const result = await this.videoModel
      .find(filter)
      .skip(skip)
      .limit(pageSize)
      .sort({ createdAt: -1 })
      .select('videoUrl totalFavorite totalReaction totalViews videoDescription videoThumbnail')

    return {
      meta: {
        current,
        pageSize,
        totalItems,
        totalPages,
      },
      result,
    };
  }

  async findByCategory(categoryName: string, current: number = 1, pageSize: number = 10) {
    const category = await this.categoriesService.findCategoryByName(categoryName);
    if (!category) {
      throw new BadRequestException(`Category '${categoryName}' not found in categories!`);
    }
    const videoCategories = await this.videoCategoriesService.findVideosByCategoryId(category._id.toString());
    const videoIds = videoCategories.map(vc => vc.videoId.toString());
    const result = await this.videoModel.find(
      { _id: { $in: videoIds } }
    )
      .select('videoUrl totalFavorite totalReaction totalViews videoDescription videoThumbnail videoTag') // ✅ Chỉ lấy các trường cần thiết
      .exec();
    return result;
  }

  async searchAdminVideos(
    searchText: string,
    current: number = 1,
    pageSize: number = 10,
  ) {
    const adminUsers = await this.userModel.find({ role: 'ADMIN' }).select('_id').exec();
    const adminUserIds = adminUsers.map(user => user._id.toString());
    const filter: any = {};
    filter.userId = { $in: adminUserIds };
    if (searchText) {
      filter.videoDescription = { $regex: new RegExp(searchText, 'i') };
    }
    const totalItems = await this.videoModel.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / pageSize);
    const skip = (current - 1) * pageSize;
    const result = await this.videoModel
      .find(filter)
      .skip(skip)
      .limit(pageSize)
      .sort({ createdAt: -1 })
      .select('videoUrl totalFavorite totalReaction totalViews videoDescription videoThumbnail videoTag videoType ')
      .exec();
    return {
      meta: {
        current,
        pageSize,
        totalItems,
        totalPages,
      },
      result,
    };
  }


  async filterAdminVideosByCategory(categoryName: string, current: number = 1, pageSize: number = 10) {
    const category = await this.categoriesService.findCategoryByName(categoryName);
    if (!category) {
      throw new BadRequestException(`Category '${categoryName}' not found in categories!`);
    }
    const videoCategories = await this.videoCategoriesService.findVideosByCategoryId(category._id.toString());
    const videoIds = videoCategories.map(vc => vc.videoId.toString());
    const adminUsers = await this.userModel.find({ role: 'admin' }).select('_id').exec();
    const adminUserIds = adminUsers.map(user => user._id.toString());
    const filter: any = {
      _id: { $in: videoIds },
      userId: { $in: adminUserIds }
    };
    const totalItems = await this.videoModel.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / pageSize);
    const skip = (current - 1) * pageSize;
    const result = await this.videoModel
      .find(filter)
      .skip(skip)
      .limit(pageSize)
      .sort({ createdAt: -1 })
      .select('videoUrl totalFavorite totalReaction totalViews videoDescription videoThumbnail videoTag videoType ')
      .exec();
    return {
      meta: {
        current,
        pageSize,
        totalItems,
        totalPages,
      },
      result,
    };
  }

}

