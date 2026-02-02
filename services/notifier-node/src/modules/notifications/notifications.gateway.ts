import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);

  private readonly connectedClients: Map<string, string> = new Map();

  async handleConnection(client: Socket) {
    this.logger.log(`New connection attempt: ${client.id}`);
    const token = client.handshake.auth?.token || client.handshake.query?.token;
    
    if (!token) {
      this.logger.warn(`Client ${client.id} tried to connect without token`);
      setTimeout(() => client.disconnect(), 1000);
      return;
    }

    try {
      const userId = this.extractUserIdFromToken(token);
      
      if (!userId) {
        throw new Error('Invalid token');
      }

      this.connectedClients.set(userId, client.id);
      client.join(userId);
      this.logger.log(`Client connected: ${client.id} (User: ${userId})`);
    } catch (error) {
      this.logger.error(`Connection verification failed: ${error.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    for (const [userId, socketId] of this.connectedClients.entries()) {
      if (socketId === client.id) {
        this.connectedClients.delete(userId);
        this.logger.log(`Client disconnected: ${client.id} (User: ${userId})`);
        break;
      }
    }
  }

  @SubscribeMessage('ping')
  handlePing(client: Socket, payload: any): string {
    return 'pong';
  }

  sendNotificationToUser(userId: string, payload: any) {
    // Emitting to the room named after the userId
    this.server.to(userId).emit('notification', payload);
    this.logger.log(`Notification sent to user ${userId}`);
  }

  private extractUserIdFromToken(token: string): string {
    return token; 
  }
}
