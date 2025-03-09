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

  @Get('list-viewing-history')
  handleGetListViewingHistory(
    @Query() query: string,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
    @Query('searchValue') searchValue: string,
  ) {
    return this.listeninghistoryService.handleGetListListeningHistory(
      query,
      +current,
      +pageSize,
      searchValue
    );
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
