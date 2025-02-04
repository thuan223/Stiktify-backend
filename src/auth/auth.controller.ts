import {
  Controller,
  Post,
  UseGuards,
  Request,
  Body,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public, ResponseMessage } from '@/decorator/customize';
import { LocalAuthGuard } from './passport/local-auth.guard';
import {
  ChangePasswordAuthDto,
  CodeAuthDto,
  CreateAuthDto,
} from './dto/create-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('login')
  @Public()
  @UseGuards(LocalAuthGuard)
  @ResponseMessage('Fetch login')
  handleLogin(@Request() req) {
    return this.authService.login(req.user);
  }
  @Post('register')
  @Public()
  register(@Body() registerDto: CreateAuthDto) {
    return this.authService.handleRegister(registerDto);
  }
  @Post('check-code')
  @Public()
  checkCode(@Body() checkCodeDto: CodeAuthDto) {
    return this.authService.checkCode(checkCodeDto);
  }
  @Post('retry-active')
  @Public()
  retryActive(@Body('email') email: string) {
    return this.authService.retryActive(email);
  }
  @Post('retry-password')
  @Public()
  retryPassword(@Body('email') email: string) {
    return this.authService.retryPassword(email);
  }
  @Post('change-password')
  @Public()
  changePassword(@Body() data: ChangePasswordAuthDto) {
    return this.authService.changePassword(data);
  }

  @Post('getUser')
  @Public()
  async getUser(@Body('token') token: string) {
    if (!token) {
      throw new UnauthorizedException('Token is required');
    }
    return this.authService.getUser(token);
  }
}
