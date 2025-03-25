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
import { SettingsService } from '../settings/settings.service';
import { firstValueFrom } from 'rxjs';
import FormData from 'form-data';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { QueryRepository } from '../neo4j/neo4j.service';
import { FriendRequestService } from '../friend-request/friend-request.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { Notification } from '../notifications/schema/notification.schema';
import { FollowService } from '../follow/follow.service';


@Injectable()
export class ShortVideosService {
  constructor(
    private readonly httpService: HttpService,
    private configService: ConfigService,
    @InjectModel(Video.name)
    private videoModel: Model<Video>,
    @InjectModel(VideoCategory.name)
    private videoCategoryModel: Model<VideoCategory>,
    @InjectModel(User.name) private userModel: Model<User>,
    @Inject(forwardRef(() => WishlistService))
    private wishListService: WishlistService,
    private videoCategoriesService: VideoCategoriesService,
    private categoriesService: CategoriesService,
    // @Inject(forwardRef(() => SettingsService))
    private settingsService: SettingsService,
    @Inject(forwardRef(() => ReportService))
    private reportService: ReportService,
    private readonly queryRepository: QueryRepository,
    private friendRequestService: FriendRequestService,
    // private followService: FollowService,
    private notificationsService: NotificationsService,
    private notificationsGateway: NotificationsGateway,
  ) {}

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
      console.log('THIS >>>', createShortVideoDto.userId);

      // Lấy danh sách bạn bè
      const friends = await this.friendRequestService.getFriendsList(
        createShortVideoDto.userId,
      );
      // Gửi thông báo đến bạn bè
      for (const friend of friends) {
        const notification = await this.notificationsService.createNotification(
          {
            sender: createShortVideoDto.userId,
            recipient: friend.friendId,
            type: 'new-video',
            postId: createdVideo._id,
          },
        );

        // Lấy thông tin đầy đủ để gửi qua WebSocket
        const populatedNotification =
          await this.notificationsService.populateNotification(
            notification._id,
          );
        console.log(populatedNotification);

        // Gửi thông báo realtime qua WebSocket
        this.notificationsGateway.sendNotification(
          createShortVideoDto.userId,
          friend.friendId,
          populatedNotification,
        );
      }

      // // Lấy danh sách follower
      // const followers: any = await this.followService.getFollowersList(
      //   createShortVideoDto.userId,
      // );
      // // Gửi thông báo đến follower
      // for (const follower of followers) {
      //   console.log(follower._id);

      //   const notification = await this.notificationsService.createNotification(
      //     {
      //       sender: createShortVideoDto.userId,
      //       recipient: follower._id,
      //       type: 'new-video',
      //       postId: createdVideo._id,
      //     },
      //   );

      //   // Lấy thông tin đầy đủ để gửi qua WebSocket
      //   const populatedNotification =
      //     await this.notificationsService.populateNotification(
      //       notification._id,
      //     );
      //   console.log(populatedNotification);

      //   // Gửi thông báo realtime qua WebSocket
      //   this.notificationsGateway.sendNotification(
      //     createShortVideoDto.userId,
      //     follower._id,
      //     populatedNotification,
      //   );
      // }
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
  async shareVideo(id: string): Promise<{
    videoUrl: string;
    videoThumbnail: string;
    videoDescription: string;
  }> {
    const video = await this.videoModel
      .findById(id)
      .select('videoUrl videoThumbnail videoDescription');

    if (!video) {
      throw new BadRequestException('Video not found');
    }

    return {
      videoUrl: video.videoUrl,
      videoThumbnail: video.videoThumbnail,
      videoDescription: video.videoDescription,
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
    let countVideo = 0;
    const setting = await this.settingsService.findAll();
    const resetScore = setting.algorithmConfig.numberVideoSuggest;

    const wishList = await this.wishListService.getWishListByUserId(
      data,
      resetScore.triggerAction,
    );
    const wishListVideoIds = wishList.map((item) => item.videoId);
    countVideo += wishListVideoIds.length;
    if (data.videoId && data.videoId.length > 0) {
      countVideo += 1;
      videoFound = await this.videoModel
        .find({ _id: { $in: data.videoId } })
        .populate('userId')
        .populate('musicId');
    }

    const collaboratorVideoIdList =
      await this.wishListService.getCollaborativeVideo(
        data.userId,
        resetScore.collaboration,
      );
    // const collaboratorVideoIdList = await this.getCollaboratorFilteringVideo(
    //   data.userId,
    //   resetScore.collaboration,
    // );
    let collaboratorVideoFound = [];
    if (collaboratorVideoIdList && collaboratorVideoIdList.length > 0) {
      countVideo += collaboratorVideoIdList.length;
      for (const collaboratorVideoId of collaboratorVideoIdList) {
        const collaboratorVideo = await this.videoModel
          .findOne({ _id: { $in: collaboratorVideoId } })
          .populate('userId')
          .populate('musicId');
        collaboratorVideoFound.push(collaboratorVideo);
      }
    }
    let videos = await this.videoModel
      .find({ _id: { $in: wishListVideoIds, $nin: collaboratorVideoIdList } })
      .populate('userId')
      .populate('musicId');
    const trendingVideos = await this.videoModel
      .find({
        _id: { $nin: [...wishListVideoIds, ...collaboratorVideoIdList] },
      })
      .sort({ totalViews: -1 })
      .limit(10)
      .populate('userId')
      .populate('musicId');

    if (trendingVideos.length > 0 && resetScore.trending > 0) {
      countVideo += resetScore.trending;
      for (let i = 1; i <= resetScore.trending; i++) {
        if (trendingVideos.length === 0) break;

        const trendingVideoChoose =
          await this.wishListService.getTheBestChoiceFromListVideo(
            trendingVideos,
            data.userId,
          );
        videos.push(trendingVideoChoose);
        const index = trendingVideos.findIndex((video) =>
          video._id.equals(trendingVideoChoose._id),
        );
        if (index !== -1) trendingVideos.splice(index, 1);
      }
    }
    if (resetScore.random > 0 || countVideo < 10) {
      const randomVideos = await this.videoModel.aggregate([
        {
          $match: {
            _id: {
              $nin: [...videos.map((v) => v._id), ...collaboratorVideoIdList],
            },
          },
        },
        { $sample: { size: Math.max(resetScore.random, 10 - countVideo) } },
      ]);
      const populatedVideos = await this.videoModel.populate(randomVideos, [
        { path: 'userId' },
        { path: 'musicId' },
      ]);
      if (videoFound)
        videos = [
          ...videoFound,
          ...videos,
          ...collaboratorVideoFound,
          ...populatedVideos,
        ];
      else {
        videos = [...videos, ...collaboratorVideoFound, ...populatedVideos];
      }
    }

    await this.wishListService.deleteWishListByUserId(data.userId);
    // console.log(videos.map((video) => video.videoDescription));
    // console.log(videos.length)
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
        { path: 'userId' },
        { path: 'musicId' },
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
      .select(
        'videoThumbnail totalReaction totalViews totalComment videoDescription videoUrl',
      )
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
        totalItems: result.length, // Lấy số lượng từ kết quả video
        totalPages: Math.ceil(result.length / pageSize),
      },
      result,
    };
  }

  async findVideoById(videoId: string) {
    return await this.videoModel.findById(videoId);
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
  async deleteVideo(
    videoId: string,
    userId: string,
  ): Promise<{ message: string }> {
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

  async getVideoNearestByUserId(
    userIds: string[],
    pageSize: number,
    current: number,
  ) {
    const filter = {
      userId: { $in: userIds },
      isDelete: false,
      isBlock: false,
    };
    const totalItems = (await this.videoModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / pageSize);

    const skip = (+current - 1) * +pageSize;

    const result = await this.videoModel
      .find(filter)
      .limit(pageSize)
      .skip(skip)
      .populate({
        path: 'userId',
        select:
          '_id userName fullname email image totalFollowers totalFollowings',
      })
      .sort({ createdAt: -1 });

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
  async getTagVideoByAi(file: Express.Multer.File): Promise<any> {
    try {
      console.log('Sending video to FastAPI:', file.originalname);
      const tags = [];

      // Hàm tạo FormData mới để tránh lỗi "stream already consumed"
      const createFormData = () => {
        const formData = new FormData();
        formData.append('file', file.buffer, {
          filename: file.originalname,
          contentType: file.mimetype,
        });
        return formData;
      };

      console.log(
        `${this.configService.get<string>('AI_GETSONG_URL')}/analyze-video/`,
      );

      const faceResponsePromise = firstValueFrom(
        this.httpService.post(
          `${this.configService.get<string>('AI_FACERECOGNITION_URL')}/analyze-video/`,
          createFormData(),
          { headers: { ...createFormData().getHeaders() }, timeout: 0 },
        ),
      ).catch((error) => {
        console.error('Lỗi nhận diện khuôn mặt:', error.message);
        return null;
      });

      const songResponsePromise = firstValueFrom(
        this.httpService.post(
          `${this.configService.get<string>('AI_GETSONG_URL')}/analyze-video/`,
          createFormData(),
          { headers: { ...createFormData().getHeaders() }, timeout: 0 },
        ),
      ).catch((error) => {
        console.error('Lỗi nhận diện bài hát:', error.message);
        return null;
      });

      const [faceResponse, songResponse] = await Promise.all([
        faceResponsePromise,
        songResponsePromise,
      ]);

      if (faceResponse) {
        tags.push(faceResponse.data.top_celebrities[0][0]);
      }
      if (songResponse) {
        tags.push(
          ...songResponse.data.music_genre,
          songResponse.data.song_title,
          songResponse.data.artist,
        );
      }
      return tags;
    } catch (error) {
      throw new Error(`Video upload failed: ${error.message}`);
    }
  }
  async watchVideo(userId: string, videoId: string, score: number) {
    try {
      // Kiểm tra xem quan hệ đã tồn tại hay chưa
      const existingScore = await this.queryRepository
        .initQuery()
        .raw(
          `
          MATCH (u:User {id: $userId})-[w:WATCHED]->(v:Video {id: $videoId})
          RETURN w.score AS currentScore
          `,
          { userId, videoId },
        )
        .first();
      if (existingScore?.currentScore !== undefined) {
        console.log(
          `Quan hệ đã tồn tại với score = ${existingScore.currentScore}`,
        );

        // Nếu score = 0, không cập nhật
        if (score === 0) {
          return;
        }

        // Nếu đã tồn tại, cập nhật điểm số
        await this.queryRepository
          .initQuery()
          .raw(
            `
            MATCH (u:User {id: $userId})-[w:WATCHED]->(v:Video {id: $videoId})
            SET w.score = w.score + $score
            RETURN w.score
            `,
            { userId, videoId, score },
          )
          .run();
      } else {
        // Nếu chưa tồn tại, tạo mới
        return await this.queryRepository
          .initQuery()
          .raw(
            `
            MERGE (u:User {id: $userId})
            MERGE (v:Video {id: $videoId})
            MERGE (u)-[w:WATCHED]->(v)
            SET w.score = $score
            RETURN w.score
            `,
            { userId, videoId, score },
          )
          .run();
      }
    } catch (error) {
      console.error(
        `Error adding watch event for ${userId} - ${videoId}:`,
        error,
      );
    }
  }

  async addTagToVideo(userId: string, tagName: string, score: number) {
    return this.queryRepository
      .initQuery()
      .raw(
        `
        MERGE (u:User {id: $userId})
        WITH u
        MATCH (u)-[w:WATCHED]->(v:Video)
        MERGE (t:Tag {name: $tagName})
        MERGE (v)-[:HAS_TAG {score: $score}]->(t)
        SET v.score = v.score + $score
        SET w.score = w.score + $score
        RETURN v.id, w.score
      `,
        { userId, tagName, score },
      )
      .run();
  }
  async addMusicToVideo(userId: string, musicId: string, score: number) {
    return this.queryRepository
      .initQuery()
      .raw(
        `
        MERGE (u:User {id: $userId})
        WITH u
        MATCH (u)-[w:WATCHED]->(v:Video)
        MERGE (m:Music {id: $musicId})
        MERGE (v)-[:HAS_MUSIC {score: $score}]->(m)
        SET v.score = v.score + $score
        SET w.score = w.score + $score
        RETURN v.id, w.score
      `,
        { userId, musicId, score },
      )
      .run();
  }
  async addCreatorToVideo(userId: string, creatorId: string, score: number) {
    return this.queryRepository
      .initQuery()
      .raw(
        `
        MERGE (u:User {id: $userId})
        WITH u
        MATCH (u)-[w:WATCHED]->(v:Video)
        MERGE (c:Creator {id: $creatorId})
        MERGE (v)-[:CREATED_BY {score: $score}]->(c)
        SET v.score = v.score + $score
        SET w.score = w.score + $score
        RETURN v.id, w.score
      `,
        { userId, creatorId, score },
      )
      .run();
  }

  async addCategoryToVideo(
    userId: string,
    categoryName: string,
    score: number,
  ) {
    return this.queryRepository
      .initQuery()
      .raw(
        `
        MERGE (u:User {id: $userId})
        WITH u
        MATCH (u)-[w:WATCHED]->(v:Video)
        MERGE (cat:Category {name: $categoryName})
        MERGE (v)-[:IN_CATEGORY {score: $score}]->(cat)
        SET v.score = v.score + $score
        SET w.score = w.score + $score
        RETURN v.id, w.score
      `,
        { userId, categoryName, score },
      )
      .run();
  }
  async getVideoDetails(videoId: string) {
    return this.queryRepository
      .initQuery()
      .raw(
        `
        MATCH (v:Video {id: $videoId})
        OPTIONAL MATCH (v)-[r:HAS_TAG]->(t:Tag)
        OPTIONAL MATCH (v)-[r2:IN_CATEGORY]->(c:Category)
        OPTIONAL MATCH (v)-[r3:CREATED_BY]->(cr:Creator)
        OPTIONAL MATCH (v)-[r4:HAS_MUSIC]->(m:Music)
        RETURN 
          v.id AS videoId,
          COLLECT(DISTINCT { name: t.name, score: r.score }) AS tags,
          COLLECT(DISTINCT { name: c.name, score: r2.score }) AS categories,
          COLLECT(DISTINCT { id: cr.id, score: r3.score }) AS creators,
          COLLECT(DISTINCT { id: m.id, score: r4.score }) AS music
      `,
        { videoId },
      )
      .run();
  }

  async getUserSimilarities(userId: string) {
    return this.queryRepository
      .initQuery()
      .raw(
        `
       // Lấy danh sách tất cả video đã từng được xem bởi bất kỳ user nào
MATCH (v:Video)
WITH COLLECT(v.id) AS allVideoIds

// Lấy danh sách video và điểm số của user1
MATCH (u1:User {id: $userId})-[r1:WATCHED]->(v:Video)
WITH u1, allVideoIds, 
     COLLECT({id: v.id, score: toFloat(r1.score)}) AS user1Videos

// Lấy danh sách video và điểm số của tất cả user khác
MATCH (u2:User)-[r2:WATCHED]->(v:Video)
WHERE u1 <> u2
WITH u1, u2, allVideoIds, user1Videos, 
     COLLECT({id: v.id, score: toFloat(r2.score)}) AS user2Videos

// Xây dựng danh sách điểm số với giá trị mặc định 0 nếu user chưa xem video
WITH u1, u2, allVideoIds,
     [x IN allVideoIds | COALESCE([v IN user1Videos WHERE v.id = x | v.score][0], 0)] AS scores1,
     [x IN allVideoIds | COALESCE([v IN user2Videos WHERE v.id = x | v.score][0], 0)] AS scores2

// Tính cosine similarity
WITH u1, u2, allVideoIds AS videoIds, scores1, scores2,
     REDUCE(sum = 0.0, i IN range(0, size(scores1)-1) | sum + scores1[i] * scores2[i]) AS dotProduct,
     SQRT(REDUCE(s = 0.0, x IN scores1 | s + x * x)) AS norm1,
     SQRT(REDUCE(s = 0.0, x IN scores2 | s + x * x)) AS norm2

RETURN u2.id AS otherUser, 
       videoIds AS allVideos,  // Trả về tất cả ID video mà không kèm theo mối quan hệ
       scores1 AS currentUserScores, 
       scores2 AS otherUserScores,
       dotProduct,
       norm1,
       norm2,
       CASE 
         WHEN norm1 * norm2 = 0 THEN 0 
         ELSE dotProduct / (norm1 * norm2) 
       END AS similarity

        `,
        { userId },
      )
      .run();
  }

  async getUserVideos(userId: string) {
    return this.queryRepository
      .initQuery()
      .raw(
        `
        MATCH (u:User {id: $userId})-[w:WATCHED]->(v:Video)
        RETURN v.id AS videoId, w.score AS score
        `,
        { userId },
      )
      .run();
  }

  async getCollaboratorFilteringVideo(
    userId: string,
    numberChooseVideo: number = 2,
  ) {

    const similarities = await this.getUserSimilarities(userId);
    const totalSimilarity = similarities.reduce(
      (sum, user) => sum + user.similarity,
      0,
    );

    if (totalSimilarity === 0) return [];

    const recommendedScores = similarities[0]?.allVideos.map((video, index) => {
      const weightedSum = similarities.reduce(
        (sum, user) => sum + user.similarity * user.otherUserScores[index],
        0,
      );
      return {
        videoId: video,
        score: weightedSum / totalSimilarity,
      };
    });

    return recommendedScores
      .sort((a, b) => b.score - a.score)
      .slice(0, numberChooseVideo)
      .map((video) => video.videoId);
  }


  // async deleteAllVideos() {
  //   try {
  //     // Xóa tất cả mối quan hệ liên quan đến video
  //     await this.queryRepository
  //       .initQuery()
  //       .raw(
  //         `
  //         MATCH (v:Video)
  //         OPTIONAL MATCH (v)-[r:WATCHED]->(u:User)
  //         OPTIONAL MATCH (v)-[r2:HAS_TAG]->(t:Tag)
  //         OPTIONAL MATCH (v)-[r3:IN_CATEGORY]->(c:Category)
  //         OPTIONAL MATCH (v)-[r4:CREATED_BY]->(cr:Creator)
  //         OPTIONAL MATCH (v)-[r5:HAS_MUSIC]->(m:Music)
  //         DELETE r, r2, r3, r4, r5
  //         `,
  //         {},
  //       )
  //       .run();

  //     // Xóa video cùng với các mối quan hệ của nó
  //     await this.queryRepository
  //       .initQuery()
  //       .raw(
  //         `
  //         MATCH (v:Video)
  //         DETACH DELETE v
  //         `,
  //         {},
  //       )
  //       .run();

  //     console.log(
  //       'Tất cả các video và mối quan hệ liên quan đã được xóa thành công.',
  //     );
  //   } catch (error) {
  //     console.error('Lỗi khi xóa video:', error);
  //   }
  // }

  async getTopVideos() {
 
    const now = new Date();
    
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    startOfWeek.setHours(0, 0, 0, 0);
  
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);
  
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    startOfYear.setHours(0, 0, 0, 0);
  
    const timeFilters = {
      Weekly: { createdAt: { $gte: startOfWeek } },
      Monthly: { createdAt: { $gte: startOfMonth } },
      Yearly: { createdAt: { $gte: startOfYear } },
      "AllTime": {}, 
    };
  
    const result = {
      Weekly: { topViews: null, topReactions: null },
      Monthly: { topViews: null, topReactions: null },
      Yearly: { topViews: null, topReactions: null },
      "AllTime": { topViews: null, topReactions: null },
    };
    for (const period in timeFilters) {
      result[period].topViews = await this.videoModel
        .find(timeFilters[period])
        .sort({ totalViews: -1 }) 
        .limit(1) 
        .exec();
      result[period].topReactions = await this.videoModel
        .find(timeFilters[period])
        .sort({ totalReactions: -1 })
        .limit(1) 
        .exec();
    }
    const formattedResult = {};
    for (const period in result) {
      formattedResult[period] = [
        {
          title:"Top 50 - Views",
          image: result[period].topViews[0]?.videoThumbnail || "",
        },
        {
          title:"Top 50 - Reactions",
          image: result[period].topReactions[0]?.videoThumbnail || "",
        },
      ];
    }
  
    return formattedResult;
  }

  
  async getTop50Videos(title: string): Promise<Video[]> {
    // Kiểm tra định dạng title
    if (!title.includes("-")) {
      throw new Error(
        "Invalid title format. Expected: type-timeframe (e.g., Views-alltime)"
      );
    }
  
    // Tách title thành type và timeframe
    const [type, timeframe] = title.split("-");
  
    // Xác định trường sắp xếp dựa trên type
    const sortField = this.getSortField(type);
  
    // Xây dựng bộ lọc thời gian dựa trên timeframe
    const timeFilter = this.getTimeFilter(timeframe);
  
    // Truy vấn MongoDB
    const top50Videos = await this.videoModel
      .find(timeFilter).populate('userId') // Lọc theo thời gian
      .sort({ [sortField]: -1 }) // Sắp xếp giảm dần theo trường tương ứng
      .limit(50) // Giới hạn 50 kết quả
      .exec();
  
    return top50Videos;
  }
  
  // Hàm helper để xác định trường sắp xếp dựa trên type
  private getSortField(type: string): string {
    switch (type.toLowerCase()) {
      case "views":
        return "totalViews";
      case "reactions":
        return "totalReaction";
      default:
        throw new Error(`Invalid type: ${type}. Expected: Views or Reactions`);
    }
  }
  
  // Hàm helper để tạo bộ lọc thời gian
  private getTimeFilter(timeframe: string): any {
    const now = new Date();
    let filter = {};
  
    switch (timeframe.toLowerCase()) {
      case "weekly": {
        const oneWeekAgo = new Date(now);
        oneWeekAgo.setDate(now.getDate() - 7);
        filter = { createdAt: { $gte: oneWeekAgo } };
        break;
      }
      case "monthly": {
        const oneMonthAgo = new Date(now);
        oneMonthAgo.setMonth(now.getMonth() - 1);
        filter = { createdAt: { $gte: oneMonthAgo } };
        break;
      }
      case "yearly": {
        const oneYearAgo = new Date(now);
        oneYearAgo.setFullYear(now.getFullYear() - 1);
        filter = { createdAt: { $gte: oneYearAgo } };
        break;
      }
      case "alltime":
        filter = {}; // Không lọc thời gian
        break;
      default:
        throw new Error(
          `Invalid timeframe: ${timeframe}. Expected: weekly, monthly, yearly, or alltime`
        );
    }
  
    return filter;
  }
}
