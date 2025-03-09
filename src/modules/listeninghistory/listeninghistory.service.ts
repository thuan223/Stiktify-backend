import { Injectable } from '@nestjs/common';

import { UpdateListeninghistoryDto } from './dto/update-listeninghistory.dto';
import { ListeningHistory } from './schemas/listeninghistory.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateListeninghistoryDto } from './dto/create-listeninghistory.dto';
import aqp from 'api-query-params';

@Injectable()
export class ListeninghistoryService {
  constructor(
    @InjectModel(ListeningHistory.name)private listeningHistoryModel: Model<ListeningHistory>,
  ) {}

  async create(createListeninghistoryDto: CreateListeninghistoryDto ) {
    const { userId, musicId } = createListeninghistoryDto;
    const existingHistory = await this.listeningHistoryModel.findOneAndUpdate(
      { userId, musicId },
      {},
      { new: true },
    );
    
    if (existingHistory) {
      return existingHistory;
    }
    const count = await this.listeningHistoryModel.countDocuments({ userId });
    if (count >= 100) {
      await this.listeningHistoryModel
        .findOneAndDelete({ userId }, { sort: { updatedAt: 1 } })
        .exec();
    }
    const newHistory = new this.listeningHistoryModel(createListeninghistoryDto);
    return await newHistory.save();
  }

    async handleGetListListeningHistory(
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
  
      let result = await this.listeningHistoryModel
        .find({
          ...filter.query,
          isDelete: { $ne: true },
        })
        .populate<{ musicId: { musicDescription: string } }>('musicId')
        .sort({ updatedAt: -1, ...sort });
  
      if (searchValue) {
        result = result.filter(
          (item) =>
            item.musicId &&
            item.musicId.musicDescription &&
            item.musicId.musicDescription
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
    return `This action returns all listeninghistory`;
  }

  findOne(id: number) {
    return `This action returns a #${id} listeninghistory`;
  }

  update(id: number, updateListeninghistoryDto: UpdateListeninghistoryDto) {
    return `This action updates a #${id} listeninghistory`;
  }

  remove(id: number) {
    return `This action removes a #${id} listeninghistory`;
  }
}
