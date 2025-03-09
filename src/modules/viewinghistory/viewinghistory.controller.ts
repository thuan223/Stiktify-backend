import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ViewinghistoryService } from './viewinghistory.service';
import { CreateViewinghistoryDto } from './dto/create-viewinghistory.dto';
import { UpdateViewinghistoryDto } from './dto/update-viewinghistory.dto';
import { Public } from '@/decorator/customize';
import { ClearOneViewingHistoryDto } from './dto/clear-one-viewing-history.dto';
import { ClearAllViewingHistoryDto } from './dto/clear-all-viewing-history.dto';

@Controller('viewinghistory')
export class ViewinghistoryController {
  constructor(private readonly viewinghistoryService: ViewinghistoryService) {}

  @Post()
  create(@Body() createViewinghistoryDto: CreateViewinghistoryDto) {
    return this.viewinghistoryService.create(createViewinghistoryDto);
  }
  @Post('clear-all')
  clearAll(@Body() clearAllViewingHistoryDto: ClearAllViewingHistoryDto) {
    return this.viewinghistoryService.clearAll(clearAllViewingHistoryDto);
  }
  
  @Post('clear')
  clearOne(@Body() clearOneViewingHistoryDto:ClearOneViewingHistoryDto) {
    return this.viewinghistoryService.clearOne(clearOneViewingHistoryDto);
  }

  @Get('list-viewing-history')
  handleGetListViewingHistory(
    @Query() query: string,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
    @Query('searchValue') searchValue: string,
  ) {
    return this.viewinghistoryService.handleGetListViewingHistory(
      query,
      +current,
      +pageSize,
      searchValue
    );
  }

  @Get()
  findAll() {
    return this.viewinghistoryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.viewinghistoryService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateViewinghistoryDto: UpdateViewinghistoryDto,
  ) {
    return this.viewinghistoryService.update(+id, updateViewinghistoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.viewinghistoryService.remove(+id);
  }
}
 