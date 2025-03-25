import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { Types } from 'mongoose';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  async createNotification(
    @Body()
    body: {
      recipient: string;
      sender: string;
      type: string;
      postId?: Types.ObjectId;
    },
  ) {
    return this.notificationsService.createNotification(body);
  }

  @Get(':recipientId')
  async getUserNotifications(
    @Param('recipientId') recipientId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number, // Mặc định là trang 1
    @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number, // Mặc định lấy 5 thông báo
  ) {
    return this.notificationsService.getNotificationsByUser(
      recipientId,
      page,
      limit,
    );
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string) {
    return this.notificationsService.markNotificationAsRead(id);
  }
}
