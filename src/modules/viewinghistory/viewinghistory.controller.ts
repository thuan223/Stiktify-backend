import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ViewinghistoryService } from './viewinghistory.service';
import { CreateViewinghistoryDto } from './dto/create-viewinghistory.dto';
import { UpdateViewinghistoryDto } from './dto/update-viewinghistory.dto';

@Controller('viewinghistory')
export class ViewinghistoryController {
  constructor(private readonly viewinghistoryService: ViewinghistoryService) {}

  @Post()
  create(@Body() createViewinghistoryDto: CreateViewinghistoryDto) {
    return this.viewinghistoryService.create(createViewinghistoryDto);
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
  update(@Param('id') id: string, @Body() updateViewinghistoryDto: UpdateViewinghistoryDto) {
    return this.viewinghistoryService.update(+id, updateViewinghistoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.viewinghistoryService.remove(+id);
  }
}
