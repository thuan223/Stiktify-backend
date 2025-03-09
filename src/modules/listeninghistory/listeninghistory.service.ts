import { Injectable } from '@nestjs/common';

import { UpdateListeninghistoryDto } from './dto/update-listeninghistory.dto';
import { ListeningHistory } from './schemas/listeninghistory.schema';
import { InjectModel } from '@nestjs/mongoose';
import { DeleteResult, Model } from 'mongoose';
import { CreateListeninghistoryDto } from './dto/create-listeninghistory.dto';
import aqp from 'api-query-params';
import { ClearAllListeningHistoryDto } from './dto/clear-all-listeninghistory.dto';

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

  async handleGetAllListeningHistory(userId: string) {
    const result = await this.listeningHistoryModel
      .find({ userId }) 
      .populate('musicId') 
      .sort({ updatedAt: -1 }); 
    if (!result || result.length === 0) {
      return { message: "Not found data!" };
    }
    return { result };
  }

  async clearAll(clearAllListeningHistoryDto: ClearAllListeningHistoryDto): Promise<DeleteResult> {
        const userId = clearAllListeningHistoryDto.userId;
        return await this.listeningHistoryModel.deleteMany(
          { userId });
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
