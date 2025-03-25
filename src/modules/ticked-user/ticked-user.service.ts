import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TickedUser, TickedUserDocument } from './schemas/ticked-user.schema';
import { CreateTickedUserDto } from './dto/create-ticked-user.dto';
import aqp from 'api-query-params';
import { UsersService } from '../users/users.service';
import { MailerService } from '@nestjs-modules/mailer';
import { User } from '../users/schemas/user.schema';

@Injectable()
export class TickedUserService {
  constructor(
    @InjectModel(TickedUser.name)
    private tickedUserModel: Model<TickedUserDocument>,
    private usersService: UsersService,
    private readonly mailerService: MailerService,
  ) {}

  async getUserTicked(query: string, current: number, pageSize: number) {
    const { filter, sort } = aqp(query);

    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;

    if (!current) current = 1;
    if (!pageSize) pageSize = 10;

    const itemData = (
      await this.tickedUserModel.find(filter).populate({
        path: 'userId',
      })
    ).filter((item) => item.userId !== null);

    const totalItems = itemData.length;
    const totalPages = Math.ceil(totalItems / pageSize);

    const skip = (+current - 1) * +pageSize;

    const resultTicked = await this.tickedUserModel.aggregate([
      {
        $group: {
          _id: '$userId',
          ticked: {
            $push: {
              _id: '$_id',
              status: '$status',
              createdAt: '$createdAt',
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          userId: '$_id',
          ticked: 1,
        },
      },
      {
        $sort: { 'ticked.createdAt': 1 },
      },
      { $skip: skip },
      { $limit: pageSize },
    ]);

    // console.log(resultTicked);

    const result = await Promise.all(
      resultTicked.map(async (element) => {
        const user = await this.usersService.checkUserById(element.userId);
        if (!user) return null;

        return {
          userData: user,
          tickedRequests: element.ticked.map((req) => ({
            id: req._id,
            status: req.status,
          })),
          total: element.ticked.length,
        };
      }),
    );

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

  async requestTick(dto: CreateTickedUserDto) {
    const user = await this.usersService.checkUserById(dto.userId);

    if (!user || user.totalFollowers < 1000) {
      return { message: 'You are not enough followers to do this.' };
    }
    const existingRequest = await this.tickedUserModel.findOne({
      userId: dto.userId,
    });
    if (existingRequest) {
      return { message: 'You have already requested a tick verification.' };
    }
    const newRequest = new this.tickedUserModel({
      userId: dto.userId,
      status: 'pending',
    });
    return await newRequest.save();
  }

  async approveTick(id: string) {
    const tickRequest = await this.tickedUserModel.findByIdAndUpdate(
      id,
      { status: 'approved' },
      { new: true },
    );
    if (!tickRequest) {
      throw new NotFoundException('Tick request not found');
    }
    const user = await this.usersService.checkUserById(tickRequest.userId);

    if (user) {
      this.mailerService.sendMail({
        to: user.email, // list of receivers
        subject: 'Congratulations for approved tick', // Subject line
        template: 'replyTickRequest',
        context: {
          name: user.userName ?? '',
          approved: true,
        },
      });
    }
    return tickRequest;
  }

  async rejectTick(id: string, reason: string) {
    const tickRequest = await this.tickedUserModel.findByIdAndUpdate(
      id,
      { status: 'rejected' },
      { new: true },
    );
    if (!tickRequest) {
      throw new NotFoundException('Tick request not found');
    }
    const user = await this.usersService.checkUserById(tickRequest.userId);
    console.log(reason);

    if (user) {
      this.mailerService.sendMail({
        to: user.email, // list of receivers
        subject: 'Reject for tick request', // Subject line
        template: 'replyTickRequest',
        context: {
          name: user.userName ?? '',
          rejected: true,
          reason: reason,
        },
      });
    }
    return tickRequest;
  }

  async getTickStatus(userId: string) {
    const tickStatus = await this.tickedUserModel.findOne({ userId });
    if (!tickStatus) {
      throw new NotFoundException('No tick request found');
    }
    return tickStatus;
  }

  checkStatusFilter(status: string) {
    if (status === 'pending') {
      return { status: 'pending' };
    } else if (status === 'rejected') {
      return { status: 'rejected' };
    } else if (status === 'approved') {
      return { status: 'approved' };
    } else {
      return {};
    }
  }

async handleFilterAndSearchUserReTicked(query: string, current: number, pageSize: number) {
  const { filter } = aqp(query);
  current = current || 1;
  pageSize = pageSize || 10;

  const handleFilter = this.checkStatusFilter(filter.filterReq || '');
  const searchRegex = filter.search ? new RegExp(`^${filter.search}`, 'i') : null;

  // Truy vấn tickedUserModel và populate thông tin từ userModel
  const tickedUsersQuery = this.tickedUserModel
    .find(handleFilter)
    .populate({
      path: 'userId',
      select: '-password', // Loại bỏ trường password
      match: searchRegex ? { $or: [{ userName: searchRegex }, { fullname: searchRegex }] } : undefined,
    })
    .skip((current - 1) * pageSize)
    .limit(pageSize);

  const tickedUsers = await tickedUsersQuery.exec();
  const totalItems = await this.tickedUserModel.countDocuments(handleFilter).exec();

  // Xử lý kết quả
  const result = tickedUsers
    .filter(t => t.userId) // Lọc bỏ các bản ghi không có userId populated (do match)
    .map(t => ({
      userData: t.userId, // Thông tin user đã được populate
      status: t.status,
    }));

  return {
    meta: {
      current,
      pageSize,
      pages: Math.ceil(totalItems / pageSize),
      total: totalItems,
    },
    result,
    message: totalItems === 0 ? 'No users found.' : '',
  };
}
}