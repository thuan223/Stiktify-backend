import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateReportMusicDto,
  CreateReportVideoDto,
} from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import aqp from 'api-query-params';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Report } from './schemas/report.schema';
import { ShortVideosService } from '../short-videos/short-videos.service';
import { MusicsService } from '../musics/musics.service';
import { UsersService } from '../users/users.service';
import { Music } from '../musics/schemas/music.schema';
import { Video } from '../short-videos/schemas/short-video.schema';

@Injectable()
export class ReportService {
  constructor(
    @InjectModel(Report.name) private reportModel: Model<Report>,
    @InjectModel(Music.name) private musicModel: Model<Music>,
    @InjectModel(Video.name) private videoModel: Model<Video>,
    @Inject(forwardRef(() => ShortVideosService))
    private shortVideosService: ShortVideosService,
    private usersService: UsersService,
    private musicsService: MusicsService,
  ) { }

  // ThangLH - report video
  async createReportVideo(createReportDto: CreateReportVideoDto) {
    const { userId, videoId, reasons } = createReportDto;
    const video = await this.shortVideosService.checkVideoById(
      videoId.toString(),
    );
    if (!video) {
      throw new NotFoundException('Video not found');
    }

    const newReport = new this.reportModel({
      userId: new Types.ObjectId(userId),
      videoId: new Types.ObjectId(videoId),
      reasons,
    });
    return await newReport.save();
  }

  // ThangLH - report music
  async createReportMusic(createReportDto: CreateReportMusicDto) {
    const { userId, musicId, reasons } = createReportDto;
    const music = await this.musicsService.checkMusicById(musicId.toString());
    if (!music) {
      throw new NotFoundException('Music not found');
    }
    const newReport = new this.reportModel({
      userId: new Types.ObjectId(userId),
      musicId: new Types.ObjectId(musicId),
      reasons,
    });
    return await newReport.save();
  }

  async findAll(query: string, current: number, pageSize: number) {
    const { filter, sort } = aqp(query);

    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;

    if (!current) current = 1;
    if (!pageSize) pageSize = 10;

    const itemData = (
      await this.reportModel.find(filter).populate({
        path: 'videoId',
        select: 'isDelete',
        match: { isDelete: false },
      })
    ).filter((item) => item.musicId === null);

    const totalItems = new Set(itemData.map((item: any) => item.videoId._id)).size;

    const totalPages = Math.ceil(totalItems / pageSize);

    const skip = (+current - 1) * +pageSize;

    const resultReport = (await this.reportModel.aggregate([
      {
        $group: {
          _id: '$videoId',
          report: {
            $push: {
              _id: '$_id',
              userId: '$userId',
              reasons: '$reasons',
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          videoId: '$_id',
          report: 1,
        },
      },
      { $skip: skip },
      { $limit: pageSize },
    ])) as IReportResult[];

    const result = [];
    for (const element of resultReport) {
      const item = await this.shortVideosService.checkVideoById(
        element.videoId,
      );
      const report = element.report;

      if (item) {
        const dataReport = [];
        for (const element of report) {
          const item = await this.usersService.checkUserById(element.userId);

          if (item) {
            const data = {
              ...item.toObject(),
              reasons: element.reasons,
            };
            dataReport.push(data);
          }
          continue;
        }

        const data = {
          dataVideo: item,
          dataReport: dataReport,
          total: element.report.length,
        };
        result.push(data);
      }
      continue;
    }

    result.sort((a, b) => b.total - a.total);

    return {
      meta: {
        current: current,
        pageSize: pageSize,
        pages: totalPages,
        total: totalItems,
      },
      result: result,
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} report`;
  }

  update(id: number, updateReportDto: UpdateReportDto) {
    return `This action updates a #${id} report`;
  }

  async checkReportVideoId(id: string) {
    try {
      const result = await this.reportModel.find({
        videoId: new Types.ObjectId(id),
      });

      if (result) {
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  async remove(id: string): Promise<any> {
    const check = await this.checkReportVideoId(id);
    if (!check) {
      return '';
    }

    const result = await this.reportModel.deleteMany({
      videoId: new Types.ObjectId(id),
    });
    return result;
  }


  async handleListMusicReport(query: string, current: number, pageSize: number) {
    const { filter, sort } = aqp(query);

    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;

    if (!current) current = 1;
    if (!pageSize) pageSize = 10;

    const itemData = (
      await this.reportModel.find({ ...filter, videoId: null }).populate({
        path: 'musicId',
        select: 'isDelete',
        match: { isDelete: false },
      })
    )
    console.log(itemData);

    const totalItems = new Set(itemData.map((item: any) => item.musicId._id)).size
    const totalPages = Math.ceil(totalItems / pageSize);

    const skip = (+current - 1) * +pageSize;

    const resultReport = (await this.reportModel.aggregate([
      {
        $group: {
          _id: '$musicId',
          report: {
            $push: {
              _id: '$_id',
              userId: '$userId',
              reasons: '$reasons',
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          musicId: '$_id',
          report: 1,
        },
      },
      { $skip: skip },
      { $limit: pageSize },
    ])) as IReportResult[];

    const result = [];
    for (const element of resultReport) {
      const item = await this.musicsService.checkMusicRById(
        element.musicId,
      );
      const report = element.report;

      if (item) {
        const dataReport = [];
        for (const element of report) {
          const item = await this.usersService.checkUserById(element.userId);

          if (item) {
            const data = {
              ...item.toObject(),
              reasons: element.reasons,
            };
            dataReport.push(data);
          }
          continue;
        }

        const data = {
          dataMusic: item,
          dataReport: dataReport,
          total: element.report.length,
        };
        result.push(data);
      }
      continue;
    }

    result.sort((a, b) => b.total - a.total);

    return {
      meta: {
        current: current,
        pageSize: pageSize,
        pages: totalPages,
        total: totalItems,
      },
      result: result,
    }
  }

  async searchReportMusic(search: string, startDate?: string, endDate?: string) {
    const searchRegex = new RegExp(search, 'i'); 
    const musicIds = await this.musicModel.find({
      musicDescription: { $regex: searchRegex },
    }).select('_id');
    if (musicIds.length === 0) {
      return { message: "No music found for the search term!" };
    }
    let dateFilter: any = {};
    if (startDate) {
      dateFilter = { ...dateFilter, createdAt: { $gte: new Date(startDate) } };
    }
    const result = await this.reportModel
      .find({
        musicId: { $in: musicIds.map(item => item._id) },
        ...dateFilter, 
      })
      .populate({
        path: 'musicId',
        select: 'musicDescription musicUrl musicThumbnail',
        populate: {
          path: 'userId',
          select: 'userName', 
        },
      })
      .populate('userId', 'userName fullname email')
      .sort({ updatedAt: -1 }) 
      .limit(10);
  
    return { result };
  }

  async searchReportVideo(search: string, startDate?: string) {
    const searchRegex = new RegExp(search, 'i'); 
    const videoIds = await this.videoModel.find({
      videoDescription: { $regex: searchRegex },
    }).select('_id');
    if (videoIds.length === 0) {
      return { message: "No video found for the search term!" };
    }
    let dateFilter: any = {};
    if (startDate) {
      dateFilter = { ...dateFilter, createdAt: { $gte: new Date(startDate) } };
    }
    const result = await this.reportModel
      .find({
        videoId: { $in: videoIds.map(item => item._id) },
        ...dateFilter, 
      })
      .populate({
        path: 'videoId',
        select: 'videoDescription videoUrl videoThumbnail',
        populate: {
          path: 'userId',
          select: 'userName', 
        },
      }) 
      .populate('userId', 'userName fullname email')
      .sort({ updatedAt: -1 }) 
      .limit(10);
    return { result }; 
  }
}
