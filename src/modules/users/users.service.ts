import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  BussinessAccountDto,
  CreateUserDto,
  UserCreateByManager,
} from './dto/create-user.dto';
import {
  UpdateUserDto,
  SendMailDto,
  UpdateShopOwnerDto,
} from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model, Types } from 'mongoose';
import { MailerService } from '@nestjs-modules/mailer';
import {
  ChangePasswordAuthDto,
  CodeAuthDto,
  CreateAuthDto,
} from '@/auth/dto/create-auth.dto';
import { hashPasswordHelper } from '@/helpers/ultil';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import aqp from 'api-query-params';
import { Video } from '../short-videos/schemas/short-video.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly mailerService: MailerService,
    @InjectModel(Video.name)
        private videoModel: Model<Video>
  ) {}
  isEmailExist = async (email: string) => {
    const isExist = await this.userModel.exists({ email });
    if (isExist) return true;
    return false;
  };
  isUsernameExist = async (userName: string) => {
    const isExist = await this.userModel.exists({ userName });
    if (isExist) return true;
    return false;
  };

  async checkUserById(id: string) {
    try {
      const result = await this.userModel
        .findById(id)
        .select('userName image email totalFollowers');

      if (result) {
        return result;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  async handleRegister(registerDto: CreateAuthDto) {
    const { userName, email, password, fullname } = registerDto;

    // check email
    const isExistEmail = await this.isEmailExist(email);
    if (isExistEmail) {
      throw new BadRequestException(`Email already exists: ${email}`);
    }
    const isExistUsername = await this.isUsernameExist(userName);
    if (isExistUsername) {
      throw new BadRequestException(`Username already exists: ${userName}`);
    }
    const hashPassword = await hashPasswordHelper(password);
    const codeId = uuidv4();
    const user = await this.userModel.create({
      userName,
      email,
      fullname,
      password: hashPassword,
      isActive: false,
      activeCode: codeId,
      codeExpired: dayjs().add(5, 'minutes'),
      image:
        'https://firebasestorage.googleapis.com/v0/b/stiktify-bachend.firebasestorage.app/o/avatars%2Fdefault_avatar.png?alt=media&token=93109c9b-d284-41ea-95e7-4786e3c69328',
    });
    // send email
    this.mailerService.sendMail({
      to: user.email, // list of receivers
      // from: 'noreply@nestjs.com', // sender address
      subject: 'Active your account at @Stiktify', // Subject line
      template: 'register',
      context: {
        name: user.userName ?? user.email,
        activationCode: codeId,
      },
    });
    // trả ra phản hồi
    return {
      _id: user._id,
    };
  }

  async findByEmail(email: string) {
    return await this.userModel.findOne({ email });
  }
  async findByUsername(userName: string) {
    return await this.userModel.findOne({ userName });
  }
  async findById(_id: string) {
    return await this.userModel.findOne({ _id });
  }
  async handleCheckCode(checkCodeDto: CodeAuthDto) {
    const user = await this.userModel.findOne({
      _id: checkCodeDto._id,
      activeCode: checkCodeDto.activeCode,
    });
    if (!user) {
      throw new BadRequestException('Invalid code or user does not exist');
    }

    const isBeforeCheck = dayjs().isBefore(user.codeExpired);
    if (isBeforeCheck) {
      await this.userModel.updateOne(
        { _id: checkCodeDto._id },
        {
          isActive: true,
        },
      );
    } else {
      throw new BadRequestException('The code is invalid or has expired');
    }

    return { isBeforeCheck };
  }
  async retryActive(email: string) {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new BadRequestException('Account does not exist');
    }
    if (user.isActive) {
      throw new BadRequestException('Account has been activated');
    }
    const codeId = uuidv4();
    await user.updateOne({
      activeCode: codeId,
      codeExpired: dayjs().add(5, 'minutes'),
    });
    this.mailerService.sendMail({
      to: user.email, // list of receivers
      // from: 'noreply@nestjs.com', // sender address
      subject: 'Active your account at @Stiktify', // Subject line
      template: 'register',
      context: {
        name: user.userName ?? user.email,
        activationCode: codeId,
      },
    });

    return { _id: user._id };
  }
  async retryPassword(email: string) {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new BadRequestException('Account does not exist');
    }
    const codeId = uuidv4();
    await user.updateOne({
      activeCode: codeId,
      codeExpired: dayjs().add(5, 'minutes'),
    });
    this.mailerService.sendMail({
      to: user.email, // list of receivers
      // from: 'noreply@nestjs.com', // sender address
      subject: 'Change your password account at @Stiktify', // Subject line
      template: 'forgotpassword',
      context: {
        name: user.userName ?? user.email,
        activationCode: codeId,
      },
    });

    return { _id: user._id, email: user?.email };
  }
  async changePassword(data: ChangePasswordAuthDto) {
    if (data.password.length < 6) {
      throw new BadRequestException('Password must have at least 6 characters');
    }
    if (data.confirmPassword.length < 6) {
      throw new BadRequestException(
        'ConfirmPassword must have at least 6 characters',
      );
    }
    if (data.confirmPassword !== data.password) {
      throw new BadRequestException(
        'Password and confirm password are not the same',
      );
    }
    let user = await this.userModel.findOne({
      email: data.userName,
      activeCode: data.activeCode,
    });
    if (!user) {
      user = await this.userModel.findOne({
        userName: data.userName,
        activeCode: data.activeCode,
      });
      if (!user) {
        throw new BadRequestException(
          'The account does not exist or the code is invalid',
        );
      }
    }
    const isBeforeCheck = dayjs().isBefore(user.codeExpired);
    if (isBeforeCheck) {
      const newPassword = await hashPasswordHelper(data.password);
      await user.updateOne({ password: newPassword });
    } else {
      throw new BadRequestException('The code is invalid or has expired');
    }
    return user.email;
  }

  async isIdExist(id: string) {
    try {
      const result = await this.userModel.findById(id);
      if (!result) return null;
      return result;
    } catch (error) {
      return null;
    }
  }

  async handleBanOrUnbannedUser(_id: string, isBan: boolean) {
    const checkId = await this.isIdExist(_id);
    if (!checkId) {
      throw new BadRequestException(`User not found with ID: ${_id}`);
    }

    const result = await this.userModel.findByIdAndUpdate(_id, {
      isBan: isBan,
      status: 'Offline',
    });
    return {
      _id: result._id,
      isBan: result.isBan,
    };
  }

  async handleCreateUser(createDto: UserCreateByManager) {
    const isExistEmail = await this.isEmailExist(createDto.email);
    if (isExistEmail) {
      throw new BadRequestException(`Email already exists: ${createDto.email}`);
    }

    const isExistUsername = await this.isUsernameExist(createDto.userName);
    if (isExistUsername) {
      throw new BadRequestException(
        `Username already exists: ${createDto.userName}`,
      );
    }
    const codeId = uuidv4();
    const hashPassword = await hashPasswordHelper(createDto.password);

    const result = await this.userModel.create({
      fullname: createDto.fullname,
      userName: createDto.userName,
      email: createDto.email,
      password: hashPassword,
      role: 'ADMIN',
      activeCode: codeId,
      codeExpired: dayjs().add(10, 'minutes'),
    });

    this.mailerService.sendMail({
      to: result.email, // list of receivers
      // from: 'noreply@nestjs.com', // sender address
      subject: 'Active your account at @Stiktify', // Subject line
      template: 'register',
      context: {
        name: result.userName ?? result.email,
        activationCode: codeId,
      },
    });
    return result;
  }

  async handleUpdate(updateUserDto: UpdateUserDto) {
    const checkId = await this.isIdExist(updateUserDto._id);
    if (!checkId) {
      throw new BadRequestException(
        `User not found with ID: ${updateUserDto._id}`,
      );
    }

    const result = await this.userModel.findByIdAndUpdate(
      updateUserDto._id,
      updateUserDto,
    );
    return {
      _id: result._id,
    };
  }

  async handleUpdateInformation(userId: string, updateFields: UpdateUserDto) {
    const checkId = await this.isIdExist(userId);
    if (!checkId) {
      throw new BadRequestException(`User not found with ID: ${userId}`);
    }

    if (updateFields.email) {
      const isExistEmail = await this.isEmailExist(updateFields.email);
      if (isExistEmail) {
        throw new BadRequestException(
          `Email already exists: ${updateFields.email}`,
        );
      }
    }

    const result = await this.userModel.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true },
    );

    return {
      image: result.image,
      fullname: result.fullname,
      email: result.email,
      phone: result.phone,
      dob: result.dob,
      address: result.address,
    };
  }

  async handleGetListUser(query: string, current: number, pageSize: number) {
    const { filter, sort } = aqp(query);

    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;

    if (!current) current = 1;
    if (!pageSize) pageSize = 10;

    //Tính tổng số lượng
    const totalItems = (await this.userModel.find(filter)).length;
    //Tính tổng số trang
    const totalPages = Math.ceil(totalItems / pageSize);

    const skip = (+current - 1) * +pageSize;

    const result = await this.userModel
      .find(filter)
      .limit(pageSize)
      .skip(skip)
      .select('-password')
      .sort(sort as any);

    return {
      meta: {
        current: current, // trang hien tai
        pageSize: pageSize, // so luong ban ghi
        pages: totalPages, // tong so trang voi dieu kien query
        total: totalItems, // tong so ban ghi
      },
      result: result,
    };
  }

  checkFilterAction(filter: string) {
    if (filter === 'lock') {
      return { isBan: true };
    } else if (filter === 'unlock') {
      return { isBan: false };
    } else if (filter === 'USERS') {
      return { role: filter };
    } else if (filter === 'ADMIN') {
      return { role: filter };
    } else {
      return {};
    }
  }

  async handleFilterAndSearch(
    query: string,
    current: number,
    pageSize: number,
  ) {
    const { filter, sort } = aqp(query);

    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;

    if (!current) current = 1;
    if (!pageSize) pageSize = 10;

    const handleFilter = this.checkFilterAction(filter.filterReq);
    const searchRegex = new RegExp(`^${filter.search}`, 'i');

    let handleSearch = [];
    if (filter.search.length > 0) {
      handleSearch = [
        { email: searchRegex },
        { userName: searchRegex },
        { fullname: searchRegex },
      ];
    }

    const totalItems = (
      await this.userModel.find({
        ...handleFilter,
        $or: handleSearch,
      })
    ).length;
    const totalPages = Math.ceil(totalItems / pageSize);

    const skip = (+current - 1) * +pageSize;

    const result = await this.userModel
      .find({
        ...handleFilter,
        $or: handleSearch,
      })
      .limit(pageSize)
      .skip(skip)
      .select('-password')
      .sort(sort as any);

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

  async searchUserAndVideo(
    searchText: string,
    current: number = 1,
    pageSize: number = 10
  ) {
    if (!searchText || searchText.trim() === '') {
      throw new BadRequestException('Search keyword cannot be empty!');
    }
    const searchRegex = new RegExp(searchText, 'i');
    const userFilter = {
         $or: [{ userName: searchRegex }, { fullname: searchRegex }],
    };
    const totalUsers = await this.userModel.countDocuments(userFilter);
    const userResult = await this.userModel
      .find(userFilter)
      .limit(5) 
      .select('userName fullname image');
    const videoFilter = { videoDescription: { $regex: searchRegex } };
    const totalVideos = await this.videoModel.countDocuments(videoFilter);
    const videoResult = await this.videoModel
      .find(videoFilter)
      .skip((current - 1) * pageSize)
      .limit(pageSize)
      .sort({ createdAt: -1 })
      .select('videoUrl videoThumbnail videoDescription totalViews')
      .populate('userId', 'videoIdvideoId');
    return {
      meta: { current, pageSize },
      data: {
        users: { totalItems: totalUsers, result: userResult },
        videos: { totalItems: totalVideos, result: videoResult },
      },
      message: totalUsers === 0 && totalVideos === 0 ? 'No results found' : 'Search results retrieved successfully',
    };
  }
  

  // Detail user - ThangLH
  async getUserById(id: string) {
    const user = await this.userModel.findById(id).select('-password');
    if (!user) {
      throw new BadRequestException(`User not found`);
    }
    return user;
  }

  async sendemail(emailDto: SendMailDto) {
    const user = await this.userModel.findOne({ email: emailDto.email });
    if (!user) {
      throw new BadRequestException('Account does not exist');
    }
    const result = await this.mailerService.sendMail({
      to: emailDto.email,
      subject: 'From admin: @Stiktify',
      template: 'sendEmail',
      context: {
        name: user.userName ?? user.email,
        content: emailDto.content,
      },
    });
    return;
  }
  // CreateUser Bussiness Account - ThangLH
  async handleCreateUserBussinessAccount(
    createDto: BussinessAccountDto,
    userId: string,
  ) {
    // Tìm user theo userId
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Kiểm tra followers
    if (user.totalFollowers < 1000) {
      throw new BadRequestException(
        'You need at least 1000 followers to register a business account',
      );
    }

    // Kiểm tra thông tin nhập vào
    if (
      !createDto.shopName ||
      !createDto.taxCode ||
      !createDto.shopBrandsAddress ||
      !createDto.shopDescription
    ) {
      throw new BadRequestException('All fields are required');
    }

    // Cập nhật thông tin business
    user.isShop = true;
    user.shopOwnerDetail = {
      shopName: createDto.shopName,
      taxCode: createDto.taxCode,
      shopBrandsAddress: createDto.shopBrandsAddress,
      shopDescription: createDto.shopDescription,
    };

    await user.save();
    return { message: 'Business account registered successfully' };
  }

  // Edit shop
  async updateShopOwner(
    id: string,
    updateShopDto: Partial<User['shopOwnerDetail']>,
  ) {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (!user.isShop) {
      throw new BadRequestException('User is not a shop owner');
    }

    return this.userModel
      .findByIdAndUpdate(
        id,
        {
          $set: {
            'shopOwnerDetail.shopName': updateShopDto.shopName,
            'shopOwnerDetail.taxCode': updateShopDto.taxCode,
            'shopOwnerDetail.shopBrandsAddress':
              updateShopDto.shopBrandsAddress,
            'shopOwnerDetail.shopDescription': updateShopDto.shopDescription,
          },
        },
        { new: true, runValidators: true },
      )
      .exec();
  }
  async getTop50Creator(
    title: string,
  ): Promise<
    (User & {
      totalFollows: number;
      totalReactions: number;
      totalViews: number;
      total: number;
    })[]
  > {
    // Tách title thành condition và timeframe
    const [condition, timeframe] = title.split('-');

    // Xác định khoảng thời gian
    let dateFilter = {};
    const now = new Date();
    if (timeframe === 'weekly') {
      dateFilter = { $gte: new Date(now.setDate(now.getDate() - 7)) };
    } else if (timeframe === 'monthly') {
      dateFilter = { $gte: new Date(now.setMonth(now.getMonth() - 1)) };
    } else if (timeframe === 'yearly') {
      dateFilter = { $gte: new Date(now.setFullYear(now.getFullYear() - 1)) };
    } else if (timeframe !== 'alltime') {
      throw new Error('Invalid timeframe');
    }

    // Pipeline tổng hợp dữ liệu
    const aggregationPipeline: any = [
      { $match: {} },
      // Lookup totalViews và totalReactions từ videos
      {
        $lookup: {
          from: 'videos',
          let: { userId: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$userId', '$$userId'] } } },
            ...(timeframe !== 'alltime'
              ? [{ $match: { createdAt: dateFilter } }]
              : []),
            {
              $group: {
                _id: null,
                totalViews: { $sum: '$totalViews' },
                totalReactions: { $sum: '$totalReaction' },
              },
            },
          ],
          as: 'videoData',
        },
      },
      // Lookup totalListeners và totalReactions từ musics
      {
        $lookup: {
          from: 'musics',
          let: { userId: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$userId', '$$userId'] } } },
            ...(timeframe !== 'alltime'
              ? [{ $match: { createdAt: dateFilter } }]
              : []),
            {
              $group: {
                _id: null,
                totalListeners: { $sum: '$totalListeners' },
                totalReactions: { $sum: '$totalReactions' },
              },
            },
          ],
          as: 'musicData',
        },
      },
      // Lookup totalFollows từ follows
      {
        $lookup: {
          from: 'follows',
          let: { userId: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$userId', '$$userId'] } } },
            ...(timeframe !== 'alltime'
              ? [{ $match: { createdAt: dateFilter } }]
              : []),
            { $group: { _id: null, totalFollows: { $sum: 1 } } },
          ],
          as: 'followData',
        },
      },
      // Dựng dữ liệu trả về với cả 3 trường
      {
        $project: {
          fullname: 1,
          image: 1,
          totalFollows: {
            $ifNull: [{ $arrayElemAt: ['$followData.totalFollows', 0] }, 0],
          },
          totalReactions: {
            $add: [
              {
                $ifNull: [
                  { $arrayElemAt: ['$videoData.totalReactions', 0] },
                  0,
                ],
              },
              {
                $ifNull: [
                  { $arrayElemAt: ['$musicData.totalReactions', 0] },
                  0,
                ],
              },
            ],
          },
          totalViews: {
            $add: [
              { $ifNull: [{ $arrayElemAt: ['$videoData.totalViews', 0] }, 0] },
              {
                $ifNull: [
                  { $arrayElemAt: ['$musicData.totalListeners', 0] },
                  0,
                ],
              },
            ],
          },
          // Trường total để sắp xếp theo condition
          total: {
            $cond: {
              if: { $eq: [condition, 'Views'] },
              then: {
                $add: [
                  {
                    $ifNull: [
                      { $arrayElemAt: ['$videoData.totalViews', 0] },
                      0,
                    ],
                  },
                  {
                    $ifNull: [
                      { $arrayElemAt: ['$musicData.totalListeners', 0] },
                      0,
                    ],
                  },
                ],
              },
              else: {
                $cond: {
                  if: { $eq: [condition, 'Reactions'] },
                  then: {
                    $add: [
                      {
                        $ifNull: [
                          { $arrayElemAt: ['$videoData.totalReactions', 0] },
                          0,
                        ],
                      },
                      {
                        $ifNull: [
                          { $arrayElemAt: ['$musicData.totalReactions', 0] },
                          0,
                        ],
                      },
                    ],
                  },
                  else: {
                    $ifNull: [
                      { $arrayElemAt: ['$followData.totalFollows', 0] },
                      0,
                    ],
                  }, // Mặc định là Follow
                },
              },
            },
          },
        },
      },
      { $sort: { total: -1 } },
      { $limit: 50 },
    ];

    // Thực thi truy vấn
    const top50 = await this.userModel.aggregate(aggregationPipeline).exec();
    return top50 as (User & {
      totalFollows: number;
      totalReactions: number;
      totalViews: number;
      total: number;
    })[];
  }

}
