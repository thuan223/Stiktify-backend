import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification } from './schema/notification.schema';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<Notification>,
  ) {}

  async createNotification(data: {
    recipient: string;
    sender: string;
    type: string;
    postId?: string;
    friendRequestId?: Types.ObjectId;
  }) {
    const notification = await this.notificationModel.create(data);

    return notification;
  }

  async getNotificationsByUser(recipient: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const toNow = skip + limit;

    const notifications = await this.notificationModel
      .find({ recipient })
      .sort({ createdAt: -1 }) // Sắp xếp thông báo mới nhất trước
      .populate('sender', 'fullname image')
      .select('recipient sender status type friendRequestId createdAt')
      .skip(skip)
      .limit(limit);

    const totalNotifications = await this.notificationModel.countDocuments({
      recipient,
    });

    return {
      notifications,
      hasMore: toNow < totalNotifications, // Xác định còn thông báo hay không
    };
  }

  async markNotificationAsRead(id: string) {
    return await this.notificationModel.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true },
    );
  }
}
