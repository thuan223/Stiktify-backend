import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
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
  async handleRegister(registerDto: CreateAuthDto) {
    const { userName, email, password } = registerDto;

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
      password: hashPassword,
      isActive: false,
      activeCode: codeId,
      codeExpired: dayjs().add(5, 'minutes'),
    });
    // send email
    this.mailerService.sendMail({
      to: user.email, // list of receivers
      // from: 'noreply@nestjs.com', // sender address
      subject: 'Active your account at @ThuanTnn', // Subject line
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

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }
  async findByEmail(email: string) {
    return await this.userModel.findOne({ email });
  }
  async findByUsername(userName: string) {
    return await this.userModel.findOne({ userName });
  }
  async handleCheckCode(checkCodeDto: CodeAuthDto) {
    const user = await this.userModel.findOne({
      _id: checkCodeDto._id,
      activeCode: checkCodeDto.activeCode,
    });
    if (!user) {
      throw new BadRequestException('The code is invalid or has expired');
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
      subject: 'Active your account at @ThuanTnn', // Subject line
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
      subject: 'Change your password account at @ThuanTnn', // Subject line
      template: 'register',
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
}
