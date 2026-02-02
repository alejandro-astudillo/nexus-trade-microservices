import { Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { Notification } from './schemas/notification.schema';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get notifications for a user' })
  @ApiQuery({ name: 'userId', required: true, type: String })
  @ApiQuery({ name: 'unreadOnly', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'List of notifications.', type: [Notification] })
  async findAll(
    @Query('userId') userId: string,
    @Query('unreadOnly') unreadOnly?: any // Receive as any to handle string 'true'/'false'
  ) {
    const isUnreadOnly = unreadOnly === 'true' || unreadOnly === true;
    return this.notificationsService.findByUserId(userId, isUnreadOnly);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a notification as read' })
  @ApiResponse({ status: 200, description: 'The notification has been marked as read.' })
  async markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }
}
