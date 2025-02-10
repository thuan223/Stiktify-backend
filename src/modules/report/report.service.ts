import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import aqp from 'api-query-params';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Report } from './schemas/report.schema';
import { ShortVideosService } from '../short-videos/short-videos.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class ReportService {
  constructor(
    @InjectModel(Report.name) private reportModel: Model<Report>,
    @Inject(forwardRef(() => ShortVideosService))
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

    const itemData = (await this.reportModel.find(filter).populate({
      path: "videoId",
      select: "isDelete",
      match: { isDelete: false },
    })).filter(item => item.videoId !== null)

    const totalItems = new Set(itemData.map((item: any) => item.videoId._id)).size;
    const totalPages = Math.ceil(totalItems / pageSize);

    const skip = (+current - 1) * +pageSize;

    const resultReport = await this.reportModel.aggregate([
      {
        $group: {
          _id: "$videoId",
          report: {
            $push: {
              _id: "$_id",
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

  async checkReportVideoId(id: string) {
    try {
      const result = await this.reportModel.find({ videoId: new Types.ObjectId(id) });

      if (result) {
        return true
      }
      return false
    } catch (error) {
      return false
    }
  }

  async remove(id: string) {
    const check = await this.checkReportVideoId(id)
    if (!check) {
      return ""
    }

    const result = await this.reportModel.deleteMany({ videoId: new Types.ObjectId(id) })
    return result
  }
}
