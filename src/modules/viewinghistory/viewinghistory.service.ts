import { Injectable } from '@nestjs/common';
import { CreateViewinghistoryDto } from './dto/create-viewinghistory.dto';
import { UpdateViewinghistoryDto } from './dto/update-viewinghistory.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class ViewinghistoryService {
 
  create(createViewinghistoryDto: CreateViewinghistoryDto) {
    return 'This action adds a new viewinghistory';
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
