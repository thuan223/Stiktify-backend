import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ListeninghistoryService } from './listeninghistory.service';
import { CreateListeninghistoryDto } from './dto/create-listeninghistory.dto';
import { UpdateListeninghistoryDto } from './dto/update-listeninghistory.dto';
import { ClearAllListeningHistoryDto } from './dto/clear-all-listeninghistory.dto';
import { DeleteResult } from 'mongoose';



@Controller('listeninghistory')
export class ListeninghistoryController {
  constructor(private readonly listeninghistoryService: ListeninghistoryService) {}

  @Post('create-listening-history')
  create(@Body() createListeninghistoryDto: CreateListeninghistoryDto) {
    return this.listeninghistoryService.create(createListeninghistoryDto);
  }

  @Post('clear-all')
  clearAll(@Body() clearAllListeningHistoryDto: ClearAllListeningHistoryDto): Promise<DeleteResult> {
      return this.listeninghistoryService.clearAll(clearAllListeningHistoryDto);
  }

  @Get('all-listening-history/:userId')
  async handleGetAllListeningHistory(@Param('userId') userId: string) {
    return this.listeninghistoryService.handleGetAllListeningHistory(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.listeninghistoryService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateListeninghistoryDto: UpdateListeninghistoryDto) {
    return this.listeninghistoryService.update(+id, updateListeninghistoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.listeninghistoryService.remove(+id);
  }
}
