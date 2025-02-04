import { Injectable } from '@nestjs/common';
import { CreateViewinghistoryDto } from './dto/create-viewinghistory.dto';
import { UpdateViewinghistoryDto } from './dto/update-viewinghistory.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ViewingHistory } from './schemas/viewinghistory.entity';
import aqp from 'api-query-params';

@Injectable()
export class ViewinghistoryService {
  constructor(
    @InjectModel(ViewingHistory.name)
    private viewingHistoryModel: Model<ViewingHistory>,
  ) {}

  async create(createViewinghistoryDto: CreateViewinghistoryDto) {
    const { userId } = createViewinghistoryDto;

    const count = await this.viewingHistoryModel.countDocuments({ userId });

    if (count >= 100) {
      await this.viewingHistoryModel
        .findOneAndDelete({ userId }, { sort: { createdAt: 1 } })
        .exec();
    }

    const newHistory = new this.viewingHistoryModel(createViewinghistoryDto);
    return await newHistory.save();
  }

  async handleGetListViewingHistory(
    query: string,
    current: number,
    pageSize: number,
  ) {
    const { filter, sort } = aqp(query);
    // Thêm điều kiện lọc theo userId
    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;

    if (filter.query) {
      filter.query = JSON.parse(filter.query); // Chuyển chuỗi JSON thành đối tượng
    }

    if (!current) current = 1;
    if (!pageSize) pageSize = 10;

    // Tính tổng số lượng
    const totalItems = await this.viewingHistoryModel.countDocuments(
      filter.query,
    );
    // Tính tổng số trang
    const totalPages = Math.ceil(totalItems / pageSize);
    const skip = (current - 1) * pageSize;
    const result = await this.viewingHistoryModel
      .find(filter.query) // filter đã bao gồm userId
      .limit(pageSize)
      .skip(skip)
      .populate('videoId') // Lấy thông tin chi tiết của video
      .sort({ createdAt: -1, ...sort });
    return {
      meta: {
        current, // trang hiện tại
        pageSize, // số lượng bản ghi
        pages: totalPages, // tổng số trang với điều kiện query
        total: totalItems, // tổng số bản ghi
      },
      result,
    };
  }

  findAll() {
    return `This action returns all viewinghistory`;
  }

  findOne(id: number) {
    return `This action returns a #${id} viewinghistory`;
  }

  update(id: number, updateViewinghistoryDto: UpdateViewinghistoryDto) {
    return `This action updates a #${id} viewinghistory`;
  }

  remove(id: number) {
    return `This action removes a #${id} viewinghistory`;
  }
}
