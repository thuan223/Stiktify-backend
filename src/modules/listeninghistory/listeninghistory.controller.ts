import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ListeninghistoryService } from './listeninghistory.service';
import { CreateListeninghistoryDto } from './dto/create-listeninghistory.dto';
import { UpdateListeninghistoryDto } from './dto/update-listeninghistory.dto';

@Controller('listeninghistory')
export class ListeninghistoryController {
  constructor(private readonly listeninghistoryService: ListeninghistoryService) {}

  @Post('create-listening-history')
  create(@Body() createListeninghistoryDto: CreateListeninghistoryDto) {
    return this.listeninghistoryService.create(createListeninghistoryDto);
  }

  @Post('clear-all/:userId')
  async clearAll(@Param('userId') userId: string) {
    return this.listeninghistoryService.clearAllHistory(userId);
  }
  

  @Get('all-listening-history/:userId')
  async handleGetAllListeningHistory(@Param('userId') userId: string) {
    return this.listeninghistoryService.handleGetAllListeningHistory(userId);
  }

  @Get('search-history')
  async searchHistory(
    @Query('search') search: string,
  ) {
    return this.listeninghistoryService.searchListeningHistory(search);
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
