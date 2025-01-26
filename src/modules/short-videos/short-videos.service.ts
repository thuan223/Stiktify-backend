import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateShortVideoDto } from './dto/create-short-video.dto';
import { UpdateShortVideoDto } from './dto/update-short-video.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Video } from './schemas/short-video.schema';
import { Model } from 'mongoose';
import aqp from 'api-query-params';
import { User } from '../users/schemas/user.schema';

@Injectable()
export class ShortVideosService {
  constructor(
    @InjectModel(Video.name) private shortVideoModel: Model<Video>,
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
      const totalItems = (await this.shortVideoModel.find(filter)).length;
      //Tính tổng số trang
      const totalPages = Math.ceil(totalItems / pageSize);

      const skip = (+current - 1) * +pageSize;

      const result = await this.shortVideoModel
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

  async isIdExist(id: string) {
    try {
      const result = await this.shortVideoModel.exists({ _id: id });
      if (result) return true;
      return false;
    } catch (error) {
      return false;
    }
  }

  async handleFlagVideo(req: { flag: boolean, _id: string }) {
    const checkId = await this.isIdExist(req._id)
    if (checkId === false) {
      throw new BadRequestException(`Short video not found with ID: ${req._id}`);
    } else {
      const result = await this.shortVideoModel.findByIdAndUpdate(req._id, { flag: req.flag })
      return result._id
    }
  }

  async findUserVideos(userId: string, current: number, pageSize: number) {
    const filter = { userId }; 
    const totalItems = await this.shortVideoModel.countDocuments(filter);
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
    const result = await this.shortVideoModel
      .find(filter)
      .skip(skip)
      .limit(pageSize)
      .sort({ createdAt: -1 }) // Sắp xếp theo thời gian tạo mới nhấ
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
  
}
