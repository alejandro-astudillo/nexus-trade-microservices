import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification, NotificationDocument } from './schemas/notification.schema';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
    private notificationsGateway: NotificationsGateway,
  ) {}

  async createAndNotify(userId: string, type: string, payload: any) {
    // 1. Save to MongoDB
    const notification = new this.notificationModel({
      userId,
      type,
      payload,
    });
    const savedNotification = await notification.save();

    // 2. Push to WebSocket
    this.notificationsGateway.sendNotificationToUser(userId, {
      id: savedNotification._id,
      type,
      payload,
      createdAt: savedNotification['createdAt'],
    });

    return savedNotification;
  }

  async findByUserId(userId: string, unreadOnly = false) {
    const filter: any = { userId };
    if (unreadOnly) {
      filter.read = false;
    }
    return this.notificationModel.find(filter).sort({ createdAt: -1 }).limit(50).exec();
  }

  async markAsRead(id: string) {
    return this.notificationModel.findByIdAndUpdate(id, { read: true }, { new: true }).exec();
  }
}
