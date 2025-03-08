import { Injectable } from '@nestjs/common';
import { CreateListeninghistoryDto } from './dto/create-listeninghistory.dto';
import { UpdateListeninghistoryDto } from './dto/update-listeninghistory.dto';

@Injectable()
export class ListeninghistoryService {
  create(createListeninghistoryDto: CreateListeninghistoryDto) {
    return 'This action adds a new listeninghistory';
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
