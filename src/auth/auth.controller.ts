import {
  Controller,
  Post,
  UseGuards,
  Request,
  Body,
  UnauthorizedException,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public, ResponseMessage } from '@/decorator/customize';
import { LocalAuthGuard } from './passport/local-auth.guard';
import {
  ChangePasswordAuthDto,
  CodeAuthDto,
  CreateAuthDto,
} from './dto/create-auth.dto';
import { MailerService } from '@nestjs-modules/mailer';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService, 
    private readonly mailerService: MailerService) {}
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
  


  @Post('mail')
  @Public()
  sendingMail() {
    this.mailerService
      .sendMail({
        to: 'thanglh.dev@gmail.com',
        subject: 'Welcome to Stikify!', 
        text: 'Welcome!', 
        template: "sendEmail",  
        context: { 
          emailTitle: 'Welcome to Stikify!',
          logoUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQSP4g_O7-1uIPXY2cZKYHBFu94F7gMzyIWOg&s',
          appName: 'Stikify',
          emailHeader: 'Welcome to the Stikify Community!',
          emailSubtitle: 'We are delighted to have you on board.',
          recipientName: 'New Member',
          emailMessage: `
            Thank you for signing up for Stikify. We are excited to provide you with the best possible experience.
            Our services are designed to make managing, connecting, and growing easier than ever.
          `,
          highlightContent: '🌟 Have a good day! 🌟',
          additionalMessage: `
            Don’t forget to explore our amazing features. If you need any assistance, feel free to reach out to us anytime.
          `,
          supportEmail: 'stiktifyapp@gmail.com',
          websiteUrl: 'https://stiktifyapp.com',
        },
      })
      .then(() => {
        console.log('Email sent successfully!');
      })
      .catch((error) => {
        console.error('Error sending email:', error);
      });
    return "ok";
  }
}
