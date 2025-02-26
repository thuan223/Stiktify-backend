import { Injectable, UnauthorizedException } from '@nestjs/common';
import {
  ChangePasswordAuthDto,
  CodeAuthDto,
  CreateAuthDto,
} from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '@/modules/users/users.service';
import { comparePasswordHelper } from '@/helpers/ultil';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    let user = await this.usersService.findByEmail(username);
    if (!user) {
      user = await this.usersService.findByUsername(username);
      if (!user) return null;
    }
    const isValidPassword = await comparePasswordHelper(pass, user.password);
    if (!isValidPassword) return null;
    return user;
  }
  async login(user: any) {
    if (user.isBan) {
      throw new UnauthorizedException('Your Account is Banned or Blocked.');
    }

    const payload = { username: user.email, sub: user._id };
    return {
      user: {
        email: user.email,
        _id: user._id,
        name: user.name,
        role: user.role,
      },
      access_token: this.jwtService.sign(payload),
    };
  }
  handleRegister = async (registerDto: CreateAuthDto) => {
    return await this.usersService.handleRegister(registerDto);
  };
  checkCode = async (checkCodeDto: CodeAuthDto) => {
    return await this.usersService.handleCheckCode(checkCodeDto);
  };
  retryActive = async (email: string) => {
    return await this.usersService.retryActive(email);
  };

  retryPassword = async (email: string) => {
    return await this.usersService.retryPassword(email);
  };
  changePassword = async (data: ChangePasswordAuthDto) => {
    return await this.usersService.changePassword(data);
  };

  async getUser(token: string) {
    if (!token) return;
    try {
      const decoded = this.jwtService.verify(token);

      const user = await this.usersService.findById(decoded.sub);

      if (!user) {
        throw new Error('User not found');
      }

      return {
        _id: user._id,
        email: user.email,
        name: user.fullname,
        role: user.role,
        image: user.image,
      };
    } catch (error) {
      console.log('Invalid or expired token');
      return null;
    }
  }
}
