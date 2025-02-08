import { Injectable } from '@nestjs/common';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import aqp from 'api-query-params';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Report } from './schemas/report.schema';
import { ShortVideosService } from '../short-videos/short-videos.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class ReportService {
  constructor(
    @InjectModel(Report.name) private reportModel: Model<Report>,
    private shortVideosService: ShortVideosService,
    private usersService: UsersService,
  ) { }


  create(createReportDto: CreateReportDto) {
    return 'This action adds a new report';
  }

  async findAll(query: string, current: number, pageSize: number) {
    const { filter, sort } = aqp(query);

    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;

    if (!current) current = 1;
    if (!pageSize) pageSize = 10;

    const totalItems = (await this.reportModel.distinct("videoId", filter)).length;
    const totalPages = Math.ceil(totalItems / pageSize);

    const skip = (+current - 1) * +pageSize;

    const resultReport = await this.reportModel.aggregate([
      {
        $group: {
          _id: "$videoId",
          report: {
            $push: {
              userId: "$userId",
              reasons: "$reasons"
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          videoId: "$_id",
          report: 1
        }
      },
      { $skip: skip },
      { $limit: pageSize }
    ]) as IReportResult[]

    const result = []

    for (const element of resultReport) {
      const item = await this.shortVideosService.checkVideoById(element.videoId)
      const report = element.report

      if (item) {
        const dataReport = []
        for (const element of report) {
          const item = await this.usersService.checkUserById(element.userId)

          if (item) {
            const data = {
              ...item.toObject(), reasons: element.reasons
            }
            dataReport.push(data)
          }
          continue
        }

        const data = {
          dataVideo: item,
          dataReport: dataReport,
          total: element.report.length
        }
        result.push(data)
      }
      continue
    }

    result.sort((a, b) => b.total - a.total)

    return {
      meta: {
        current: current,
        pageSize: pageSize,
        pages: totalPages,
        total: totalItems,
      },
      result: result,
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} report`;
  }

  update(id: number, updateReportDto: UpdateReportDto) {
    return `This action updates a #${id} report`;
  }

  remove(id: number) {
    return `This action removes a #${id} report`;
  }
}
