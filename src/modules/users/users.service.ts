import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto, UserCreateByManager } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
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

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly mailerService: MailerService,
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
        .select("userName image")

      if (result) {
        return result
      }
      return null
    } catch (error) {
      return null
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

    const totalItems = (await this.userModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / pageSize);

    const skip = (+current - 1) * +pageSize;
    const searchRegex = new RegExp(`^${filter.search}`, 'i');

    const handleFilter = this.checkFilterAction(filter.filterReq);

    let handleSearch = [];
    if (filter.search.length > 0) {
      handleSearch = [
        { email: searchRegex },
        { userName: searchRegex },
        { fullname: searchRegex },
      ];
    }

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
        current: current, // trang hien tai
        pageSize: pageSize, // so luong ban ghi
        pages: totalPages, // tong so trang voi dieu kien query
        total: totalItems, // tong so ban ghi
      },
      result: result,
    };
  }

  async handleSearchUser(
    search: string,
    current: number = 1,
    pageSize: number = 10,
    sort: any = {},
  ) {
    if (!search || search.trim() === '') {
      throw new BadRequestException('Search keyword cannot be empty!');
    }

    const searchRegex = new RegExp(search, 'i');
    const filter = {
      $and: [
        {
          $or: [{ userName: searchRegex }, { fullname: searchRegex }],
        },
        { role: { $ne: 'ADMIN' } },
      ],
    };

    const totalItems = await this.userModel.countDocuments(filter);

    if (totalItems === 0) {
      throw new BadRequestException(
        'No users found matching your search criteria!',
      );
    }

    const skip = (current - 1) * pageSize;
    const result = await this.userModel
      .find(filter)
      .skip(skip)
      .limit(pageSize)
      .sort(sort)
      .select('userName fullname');

    return {
      meta: {
        current,
        pageSize,
        totalItems,
        totalPages: Math.ceil(totalItems / pageSize),
      },
      result,
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
  
    
}
