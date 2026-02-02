import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { NotificationsService } from './notifications.service';

@Controller()
export class NotificationsListener {
  constructor(private readonly notificationsService: NotificationsService) {}

  @EventPattern('order_filled')
  async handleOrderFilled(@Payload() data: any) {
    console.log('Received order_filled event:', data);
    const userId = data.userId || data.UserId;
    
    if (userId) {
      await this.notificationsService.createAndNotify(
        userId,
        'OrderFilled',
        data
      );
    }
  }
}
