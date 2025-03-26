import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { ReportService } from './report.service';
import {
  CreateReportMusicDto,
  CreateReportVideoDto,
} from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { ResponseMessage } from '@/decorator/customize';

@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) { }

  //ThangLH - report video
  @Post('report-video')
  async createReportVideo(@Body() createReportDto: CreateReportVideoDto) {
    return this.reportService.createReportVideo(createReportDto);
  }
  //ThangLH - report music
  @Post('report-music')
  async createReportMusic(@Body() createReportDto: CreateReportMusicDto) {
    return this.reportService.createReportMusic(createReportDto);
  }

  @Get('list-report')
  findAll(
    @Query() query: string,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ) {
    return this.reportService.findAll(query, +current, +pageSize);
  }

  @Get('list-report-music')
  getListMusicReport(
    @Query() query: string,
    @Query('current') current: string,
    @Query('pageSize') pageSize: string,
  ) {
    return this.reportService.handleListMusicReport(query, +current, +pageSize);
  }

  @Delete('delete-report/:_id')
  @ResponseMessage('Deleted successfully')
  remove(@Param('_id') _id: string): Promise<any> {
    if (!_id) throw new BadRequestException('id must not be empty');
    return this.reportService.remove(_id);
  }

  @Get('search-music')
  async searcMusicReport(
    @Query('search') search: string,
    @Query('startDate') startDate?: string,
  ) {
    return this.reportService.searchReportMusic(search, startDate);
  }

  @Get('search-video')
  async searchVideoReport(
    @Query('search') search: string,
    @Query('startDate') startDate?: string,
  ) {
    return this.reportService.searchReportVideo(search, startDate);
  }
  
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reportService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateReportDto: UpdateReportDto) {
    return this.reportService.update(+id, updateReportDto);
  }
}
