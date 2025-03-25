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
    recipient: string | Types.ObjectId;
    sender: string | Types.ObjectId;
    type: string;
    postId?: Types.ObjectId;
    musicId?: Types.ObjectId;
    friendRequestId?: Types.ObjectId;
    status?: string;
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
      .select(
        'recipient sender status type friendRequestId createdAt postId musicId',
      )
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
      { status: 'read' },
      { new: true },
    );
  }

  async populateNotification(id: Types.ObjectId) {
    return await this.notificationModel
      .findById(id)
      .populate('sender', 'fullname image')
      .select(
        'recipient sender type postId musicId status createdAt friendRequestId',
      )
      .lean();
  }

  async findNotification(filter: {
    sender?: string;
    recipient?: string;
    type?: string;
    postId?: string;
    musicId?: string;
    status?: string;
    friendRequestId?: Types.ObjectId;
  }) {
    const query: any = {};

    if (filter.sender) query.sender = filter.sender;
    if (filter.recipient) query.recipient = filter.recipient;
    if (filter.type) query.type = filter.type;
    if (filter.postId) query.postId = filter.postId;
    if (filter.musicId) query.musicId = filter.musicId;
    if (filter.status) query.status = filter.status;
    if (filter.friendRequestId) query.friendRequestId = filter.friendRequestId;

    return this.notificationModel.findOne(query);
  }
}
