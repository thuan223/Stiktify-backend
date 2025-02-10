import { BadRequestException, forwardRef, Inject, Injectable } from '@nestjs/common';
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
import { ReportService } from '../report/report.service';



@Injectable()
export class ShortVideosService {
  constructor(
    @InjectModel(Video.name)
    private videoModel: Model<Video>,
    @InjectModel(User.name) private userModel: Model<User>,
     @Inject(forwardRef(() => WishlistService)) 
    private wishListService:WishlistService,
    private videoCategoriesService: VideoCategoriesService,
    private categoriesService: CategoriesService,
    @Inject(forwardRef(() => ReportService))
    private reportService: ReportService,
  ) { }


  // Upload a new video
  async create(createShortVideoDto: CreateShortVideoDto): Promise<Video> {
    try {
      const newVideo = new this.videoModel(createShortVideoDto);
      return await newVideo.save();
    } catch (error) {
      throw new BadRequestException('Failed to upload video');
    }
  }

// Find one video by ID
async findOne(id: string): Promise<Video> {
  try {
    const video = await this.videoModel.findById(id).exec();
    if (!video || video.isDelete) {
      throw new BadRequestException('Video not found or is deleted');
    }
    return video;
  } catch (error) {
    throw new BadRequestException('Failed to retrieve the video');
  }
}

// Update a video's details
async update(id: string, updateShortVideoDto: UpdateShortVideoDto): Promise<Video> {
  try {
    const updatedVideo = await this.videoModel.findByIdAndUpdate(id, updateShortVideoDto, { new: true }).exec();
    if (!updatedVideo) {
      throw new BadRequestException('Video not found');
    }
    return updatedVideo;
  } catch (error) {
    throw new BadRequestException('Failed to update video');
  }
}
  

// Delete (mark isDeleted as True) a short video
async remove(videoId: string, userId: string): Promise<{ message: string }> {
  const video = await this.videoModel.findById(videoId);
  if (!video) {
    throw new BadRequestException('Video not found');
  }
  if (video.userId.toString() !== userId) {
    throw new BadRequestException('Unauthorized to delete this video');
  }

  // Set isDeleted to true
  video.isDelete = true;
  await video.save();

  return { message: 'Video marked as deleted successfully' };
}

  // Share a video
  async shareVideo(id: string): Promise<{ videoUrl: string }> {
    const video = await this.videoModel.findById(id).select("videoUrl");
    if (!video) {
      throw new BadRequestException('Video not found');
    }
  
    return { videoUrl: video.videoUrl };
  }
  

// // Report video
// async reportVideo(videoId: string, reason: string, userId: string): Promise<Video> {
//   const video = await this.videoModel.findById(videoId);

//   if (!video) {
//     throw new BadRequestException('Video not found');
//   }
//   // Kiểm tra xem người dùng đã báo cáo video chưa
//   if (video.reports.includes(userId)) {
//     throw new BadRequestException('You have already reported this video');
//   }
//   // Thêm lý do vào danh sách báo cáo
//   video.reports.push(reason);
//   video.totalReports += 1; // Tăng tổng số báo cáo
//   await video.save();
//   return video;
// }

// // Like or unlike a video
// async likeVideo(videoId: string, userId: string): Promise<{ message: string; totalLikes: number }> {
//   const video = await this.videoModel.findById(videoId);
//   if (!video) {
//     throw new BadRequestException('Video not found');
//   }

//   // Check if the user already liked the video
//   const index = video.likedBy.indexOf(userId as any);
//   if (index === -1) {
//     // Add like
//     video.likedBy.push(userId as any);
//   } else {
//     // Remove like (unlike)
//     video.likedBy.splice(index, 1);
//   }

//   // Update totalFavorite
//   video.totalFavorite = video.likedBy.length;
//   await video.save();

//   const message = index === -1 ? 'Video liked successfully' : 'Video unliked successfully';
//   return { message, totalLikes: video.totalFavorite };
// }


  async findAll(query: string, current: number, pageSize: number) {
    try {
      const { filter, sort } = aqp(query);

      if (filter.current) delete filter.current;
      if (filter.pageSize) delete filter.pageSize;

      if (!current) current = 1;
      if (!pageSize) pageSize = 10;

      //Tính tổng số lượng
      const totalItems = (await this.videoModel.find(filter).where({ isDelete: false })).length;
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
        .where({ isDelete: false })

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
  

  async checkVideoById(id: string) {
    try {
      const result = await this.videoModel
        .findById(id)
        .populate("userId", "userName")
        .select("-totalComment -totalReaction")
        .where({ isDelete: false })

      if (result) {
        return result
      }
      return null
    } catch (error) {
      return null
    }
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
      // await this.reportService.remove(_id)
      return result._id
    }
  }

  async ViewVideoPosted(userId: string, current: number, pageSize: number) {
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
      .select('videoThumbnail totalReaction totalViews totalComment videoDescription')

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
      .populate('userId', 'userName');

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
    const regex = new RegExp(categoryName, 'i');
    const videoCategories = await this.videoCategoriesService.findVideosByCategoryId(category._id.toString());
    const filter = { categoryName: { $regex: regex } };
    const videoIds = videoCategories.map(vc => vc.videoId.toString());
    const totalItems = await this.videoModel.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / pageSize);
    const result = await this.videoModel.find(
      { _id: { $in: videoIds } }
    )
      .populate('userId')
      .select('videoUrl totalFavorite totalReaction totalViews videoDescription videoThumbnail videoTag') // ✅ Chỉ lấy các trường cần thiết
      .exec()
      
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

  checkFilterAction(filter: string) {
    if (filter === "categoryName") {
      return { categoryName: true }
    } else if (filter === "null") {
      return { categoryName: false }
    } else {
      return {}
    }
  }

  async handleFilterSearchVideo(query: string, current: number, pageSize: number) {
    const { filter, sort } = aqp(query);

    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;

    if (!current) current = 1;
    if (!pageSize) pageSize = 10;

    const totalItems = (await this.videoModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / pageSize);

    const skip = (+current - 1) * +pageSize;
    const searchRegex = new RegExp(`^${filter.search}`, 'i');

    const handleFilter = this.checkFilterAction(filter.filterReq)

    let handleSearch = [];
    if (filter.search.length > 0) {
      handleSearch = [
        { email: searchRegex },
      ]
    }

    const result = await this.videoModel
      .find({
        ...handleFilter,
        $or: handleSearch,
      })
      .limit(pageSize)
      .skip(skip)
      .select('-password')
      .sort(sort as any)

    return {
      meta: {
        current: current, // trang hien tai
        pageSize: pageSize, // so luong ban ghi
        pages: totalPages, // tong so trang voi dieu kien query
        total: totalItems, // tong so ban ghi
      },
      result: result,
    };
  }
}

