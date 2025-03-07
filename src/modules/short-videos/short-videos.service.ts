import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { CreateShortVideoDto } from './dto/create-short-video.dto';
import { UpdateShortVideoDto } from './dto/update-short-video.dto';
import { TrendingVideoDto } from './dto/trending-video.dto';
import { Video } from './schemas/short-video.schema';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import { WishlistService } from '../wishlist/wishlist.service';
import { CreateWishListVideoDto } from './dto/create-wishlist-videos.dto';
import { VideoCategoriesService } from '../video-categories/video-categories.service';
import aqp from 'api-query-params';
import { CategoriesService } from '../categories/categories.service';
import { User } from '../users/schemas/user.schema';
import { ReportService } from '../report/report.service';
import { UpdateVideoByViewingDto } from './dto/update-view-by-viewing.dto';
import { VideoCategory } from '../video-categories/schemas/video-category.schema';

@Injectable()
export class ShortVideosService {
  constructor(
    @InjectModel(Video.name)
    private videoModel: Model<Video>,
    @InjectModel(VideoCategory.name)
    private videoCategoryModel: Model<VideoCategory>,
    @InjectModel(User.name) private userModel: Model<User>,
    @Inject(forwardRef(() => WishlistService))
    private wishListService: WishlistService,
    private videoCategoriesService: VideoCategoriesService,
    private categoriesService: CategoriesService,
    @Inject(forwardRef(() => ReportService))
    private reportService: ReportService,
  ) { }

  //Create a new short video - ThangLH
  async create(createShortVideoDto: CreateShortVideoDto): Promise<Video> {
    try {
      // Tạo video mới và lưu vào bảng video
      const createdVideo = await this.videoModel.create(createShortVideoDto);
      // Nếu DTO có danh sách categories, tạo các bản ghi trong bảng video-categories
      if (createShortVideoDto.categories?.length) {
        const videoCategories = createShortVideoDto.categories.map(
          (categoryId) => ({
            videoId: createdVideo._id,
            categoryId,
          }),
        );
        await this.videoCategoryModel.insertMany(videoCategories);
      }
      return createdVideo;
    } catch (error) {
      throw new BadRequestException('Failed to create video post');
    }
  }
  // Tạo ra những bảng ghi video categories dự trên id của video vừa tạo ra và các categoryid trong caterogies từ dto

  // Lấy ra video dự vào UserId - ThangLH
  async getVideosByUserId(userId: string): Promise<Video[]> {
    return this.videoModel
      .find({ userId: new mongoose.Types.ObjectId(userId), isDelete: false })
      .populate('userId', 'userName')
      .exec();
  }

  // Update a video's details
  async update(
    id: string,
    updateShortVideoDto: UpdateShortVideoDto,
  ): Promise<Video> {
    try {
      const updatedVideo = await this.videoModel
        .findByIdAndUpdate(id, updateShortVideoDto, { new: true })
        .exec();
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
  async shareVideo(id: string): Promise<{ videoUrl: string; videoThumbnail: string; videoDescription: string }> {
    const video = await this.videoModel
      .findById(id)
      .select('videoUrl videoThumbnail videoDescription');

    if (!video) {
      throw new BadRequestException('Video not found');
    }

    return {
      videoUrl: video.videoUrl,
      videoThumbnail: video.videoThumbnail,
      videoDescription: video.videoDescription
    };
  }
  async findAll(query: string, current: number, pageSize: number) {
    try {
      const { filter, sort } = aqp(query);

      if (filter.current) delete filter.current;
      if (filter.pageSize) delete filter.pageSize;

      if (!current) current = 1;
      if (!pageSize) pageSize = 10;

      //Tính tổng số lượng
      const totalItems = (
        await this.videoModel.find(filter).where({ isDelete: false })
      ).length;
      //Tính tổng số trang
      const totalPages = Math.ceil(totalItems / pageSize);

      const skip = (+current - 1) * +pageSize;

      const result = await this.videoModel
        .find(filter)
        .limit(pageSize)
        .skip(skip)
        .select('-password')
        .sort(sort as any)
        .populate('userId', 'userName')
        .where({ isDelete: false });

      return {
        meta: {
          current: current, // trang hien tai
          pageSize: pageSize, // so luong ban ghi
          pages: totalPages, // tong so trang voi dieu kien query
          total: totalItems, // tong so ban ghi
        },
        result: result,
      };
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async checkVideoById(id: string) {
    try {
      const result = await this.videoModel
        .findById(id)
        .populate('userId', 'userName')
        .select('-totalComment -totalReaction')
        .where({ isDelete: false });

      if (result) {
        return result;
      }
      return null;
    } catch (error) {
      return null;
    }
  }
  async getTrendingVideosByUser(data: TrendingVideoDto) {
    let videoFound;
    let maxvideo = 10;
    const wishList = await this.wishListService.getWishListByUserId(data);
    const wishListVideoIds = wishList.map((item) => item.videoId);

    if (data.videoId && data.videoId.length > 0) {
      videoFound = await this.videoModel
        .find({ _id: { $in: data.videoId } })
        .populate('userId');
      maxvideo = 9;
    }

    let videos = await this.videoModel
      .find({ _id: { $in: wishListVideoIds } })
      .populate('userId');
    const topVideos = await this.videoModel
      .find({ _id: { $nin: wishListVideoIds } })
      .sort({ totalViews: -1 })
      .limit(10)
      .populate('userId');
    if (topVideos.length > 0) {
      const topVideoChoosen = await this.wishListService.getTheBestChoiceFromListVideo(topVideos, data.userId)
      videos.push(topVideoChoosen)
    }

    const remainingCount = maxvideo - videos.length;

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
        { path: 'userId' },
      ]);
      if (videoFound) videos = [...videoFound, ...videos, ...populatedVideos];
      else {
        videos = [...videos, ...populatedVideos];
      }
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
        { path: 'userId' }, { path: "musicId" }
      ]);
      videos = [...videos, ...populatedVideos];
    }
    // return videos.map((video) => video.videoDescription);
    return videos;
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
    const checkId = await this.isIdExist(_id);
    if (checkId === false) {
      throw new BadRequestException(`Short video not found with ID: ${_id}`);
    } else {
      const result = await this.videoModel.findByIdAndUpdate(_id, {
        flag: flag,
      });
      // await this.reportService.remove(_id)
      return result._id;
    }
  }

  async ViewVideoPosted(userId: string, current: number, pageSize: number) {
    const filter = { userId: new mongoose.Types.ObjectId(userId) };
    const result = await this.videoModel
      .find(filter)
      .skip((current - 1) * pageSize)
      .limit(pageSize)
      .sort({ createdAt: -1 })
      .select('videoThumbnail totalReaction totalViews totalComment videoDescription videoUrl')
      .populate('userId');
    if (result.length === 0) {
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

    // Trả về kết quả video mà không cần tính count
    return {
      meta: {
        current,
        pageSize,
        totalItems: result.length,  // Lấy số lượng từ kết quả video
        totalPages: Math.ceil(result.length / pageSize),
      },
      result,
    };
  }


  async findVideoById(videoId: string) {
    return await this.videoModel.findById(videoId);
  }

  async searchVideosByDescription(
    searchText: string,
    current: number,
    pageSize: number,
  ) {
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
      .select(
        'videoUrl totalFavorite totalReaction totalViews videoDescription videoThumbnail',
      )
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

  async findByCategory(
    categoryName: string,
    current: number = 1,
    pageSize: number = 10,
  ) {
    const category =
      await this.categoriesService.findCategoryByName(categoryName);
    if (!category) {
      throw new BadRequestException(
        `Category '${categoryName}' not found in categories!`,
      );
    }
    const regex = new RegExp(categoryName, 'i');
    const videoCategories =
      await this.videoCategoriesService.findVideosByCategoryId(
        category._id.toString(),
      );
    const filter = { categoryName: { $regex: regex } };
    const videoIds = videoCategories.map((vc) => vc.videoId.toString());
    const totalItems = await this.videoModel.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / pageSize);
    const result = await this.videoModel
      .find({ _id: { $in: videoIds } })
      .populate('userId')
      .select(
        'videoUrl totalFavorite totalReaction totalViews videoDescription videoThumbnail videoTag',
      ) // ✅ Chỉ lấy các trường cần thiết
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

  checkFilterAction(filter: string) {
    if (filter === 'categoryName') {
      return { categoryName: true };
    } else if (filter === 'null') {
      return { categoryName: false };
    } else {
      return {};
    }
  }

  async handleFilterSearchVideo(
    query: string,
    current: number,
    pageSize: number,
  ) {
    const { filter, sort } = aqp(query);

    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;

    if (!current) current = 1;
    if (!pageSize) pageSize = 10;

    const totalItems = (await this.videoModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / pageSize);

    const skip = (+current - 1) * +pageSize;
    const searchRegex = new RegExp(`^${filter.search}`, 'i');

    const handleFilter = this.checkFilterAction(filter.filterReq);

    let handleSearch = [];
    if (filter.search.length > 0) {
      handleSearch = [{ email: searchRegex }];
    }
    // const handleFilter = filter.filterReq ? await this.checkFilterMusic(filter.filterReq) : {};
    const result = await this.videoModel
      .find({
        ...handleFilter,
        $or: handleSearch,
      })
      .limit(pageSize)
      .skip(skip)
      .select('-password')
      .sort(sort as any);

    return {
      meta: {
        current,
        pageSize,
        total: totalItems,
        pages: totalPages,
      },
      result,
    };
  }

  async updateViewByViewing(updateVideoByViewingDto: UpdateVideoByViewingDto) {
    return await this.videoModel.findByIdAndUpdate(
      updateVideoByViewingDto.videoId,
      { $inc: { totalViews: 1 } },
      { new: true },
    );
  }

  async findVideoBySuggest(suggest: any, videoId: string) {
    let matchQuery: any = {};

    // Điều kiện tìm kiếm trực tiếp trên bảng video
    if (suggest.musicID) matchQuery.musicId = suggest.musicID;
    if (suggest.creatorId) matchQuery.userId = suggest.creatorId;
    if (suggest.tags && suggest.tags.length > 0) {
      matchQuery.videoTag = { $all: suggest.tags }; // videoTag là mảng trong bảng video
    }
    matchQuery._id = { $ne: new mongoose.Types.ObjectId(videoId) };

    let pipeline: any[] = [
      {
        $lookup: {
          // Join bảng videoCategory
          from: 'videocategories',
          localField: '_id',
          foreignField: 'videoId',
          as: 'categories',
        },
      },
      { $match: matchQuery }, // Lọc điều kiện trước khi xử lý category
    ];

    // Lọc theo categoryId nếu có
    if (suggest.categoryId && suggest.categoryId.length > 0) {
      pipeline.push({
        $match: {
          'categories.categoryId': { $all: suggest.categoryId },
        },
      });
    }
    // Thực hiện query
    let videoList = await this.videoModel.aggregate(pipeline);
    return videoList;
  }

  // Delete video - ThangLH
  async deleteVideo(videoId: string, userId: string): Promise<{ message: string }> {
    // Tìm video theo videoId
    const video = await this.videoModel.findById(videoId);
    if (!video) {
      throw new BadRequestException('Video not found');
    }
    // Kiểm tra quyền xóa: chỉ chủ sở hữu mới có quyền xóa
    if (video.userId.toString() !== userId) {
      throw new BadRequestException('Unauthorized to delete this video');
    }
    // Cập nhật trạng thái isDelete thành true
    video.isDelete = true;
    await video.save();

    return { message: 'Video marked as deleted successfully' };
  }

  async getVideoNearestByUserId(userIds: string[], pageSize: number, current: number) {
    const filter = {
      userId: { $in: userIds },
      isDelete: false,
      isBlock: false,
    }
    const totalItems = (await this.videoModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / pageSize);

    const skip = (+current - 1) * +pageSize;

    const result = await this.videoModel
      .find(filter)
      .limit(pageSize)
      .skip(skip)
      .populate({
        path: 'userId',
        select: "_id userName fullname email image totalFollowers totalFollowings",
      })
      .sort({ createAt: -1 });

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