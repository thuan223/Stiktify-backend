import { Injectable } from '@nestjs/common';
import { CreateViewinghistoryDto } from './dto/create-viewinghistory.dto';
import { UpdateViewinghistoryDto } from './dto/update-viewinghistory.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ViewingHistory } from './schemas/viewinghistory.entity';
import aqp from 'api-query-params';
import { ClearOneViewingHistoryDto } from './dto/clear-one-viewing-history.dto';
import { ClearAllViewingHistoryDto } from './dto/clear-all-viewing-history.dto';

@Injectable()
export class ViewinghistoryService {
  constructor(
    @InjectModel(ViewingHistory.name)
    private viewingHistoryModel: Model<ViewingHistory>,
  ) {}

  async create(createViewinghistoryDto: CreateViewinghistoryDto) {
    const { userId, videoId } = createViewinghistoryDto;

    const existingHistory = await this.viewingHistoryModel.findOneAndUpdate(
      { userId, videoId },
      {},
      { new: true },
    );

    if (existingHistory) {
      return existingHistory;
    }

    const count = await this.viewingHistoryModel.countDocuments({ userId });
    if (count >= 100) {
      await this.viewingHistoryModel
        .findOneAndDelete({ userId }, { sort: { updatedAt: 1 } })
        .exec();
    }

    const newHistory = new this.viewingHistoryModel(createViewinghistoryDto);
    return await newHistory.save();
  }

  async handleGetListViewingHistory(
    query: string,
    current: number,
    pageSize: number,
    searchValue: string,
  ) {
    const { filter, sort } = aqp(query);

    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;
    if (filter.searchValue) delete filter.searchValue;

    if (filter.query.$in) {
      filter.query = filter.query.$in;
    }
    filter.query = JSON.parse(filter.query);

    if (!filter.query.updatedAt || filter.query.updatedAt?.length === 0) {
      filter.query = { userId: filter.query.userId };
    }

    if (filter.query?.updatedAt && typeof filter.query.updatedAt === 'string') {
      const date = new Date(filter.query.updatedAt);
      if (!isNaN(date.getTime())) {
        const isoDateStr = date.toISOString().split('T')[0];

        filter.query.updatedAt = {
          $gte: new Date(`${isoDateStr}T00:00:00.000Z`),
          $lt: new Date(`${isoDateStr}T23:59:59.999Z`),
        };
      }
    }

    if (!current) current = 1;
    if (!pageSize) pageSize = 10;

    let result = await this.viewingHistoryModel
      .find({
        ...filter.query,
        isDelete: { $ne: true },
      })
      .populate<{ videoId: { videoDescription: string } }>('videoId')
      .sort({ updatedAt: -1, ...sort });

    if (searchValue) {
      result = result.filter(
        (item) =>
          item.videoId &&
          item.videoId.videoDescription &&
          item.videoId.videoDescription
            .toLowerCase()
            .includes(searchValue.toLowerCase()),
      );
    }

    const paginatedResult = result.slice(
      (current - 1) * pageSize,
      current * pageSize,
    );

    return { result: paginatedResult };
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
  async findByVideoId(videoId: string, userId: string) {
    return await this.viewingHistoryModel.findOne({ videoId, userId });
  }
  async clearAll(clearAllViewingHistoryDto: ClearAllViewingHistoryDto) {
    const userId = clearAllViewingHistoryDto.userId;
    return await this.viewingHistoryModel.updateMany(
      { userId },
      { isDelete: true },
      { new: true },
    );
  }
  async clearOne(clearOneViewingHistoryDto: ClearOneViewingHistoryDto) {
    const id = clearOneViewingHistoryDto.id;
    return await this.viewingHistoryModel.findOneAndUpdate(
      { _id: id },
      { isDelete: true },
      { new: true },
    );
  }
}
