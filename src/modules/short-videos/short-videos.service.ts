import { Injectable } from '@nestjs/common';
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
}
