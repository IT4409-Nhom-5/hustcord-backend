import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { MessageService } from '../message/message.service';
import { MessageDto } from './dto/message.dto';

@WebSocketGateway({ 
  cors: {
    origin: '*',
  },
  transports: ['websocket', 'polling']
})
export class ChannelGateway {
  constructor(private messageService: MessageService) {}

  @WebSocketServer()
  server: Server;

  // Hàm hỗ trợ để phát tin nhắn từ Controller
  emitMessage(message: any) {
    if (this.server) {
      this.server.emit('MESSAGE_CREATE', message);
    } else {
      console.warn('[WS] Server not initialized yet');
    }
  }

  emitChannelCreate(channel: any) {
    if (this.server) {
      this.server.emit('CHANNEL_CREATE', channel);
    }
  }

  emitGuildCreate(guild: any) {
    if (this.server) {
      this.server.emit('GUILD_CREATE', guild);
    }
  }

  @SubscribeMessage('sync-guild')
  handleSyncGuild(@MessageBody() guild: any) {
    this.server.emit('sync-guild', guild);
  }

  @SubscribeMessage('sync-delete-guild')
  handleSyncDeleteGuild(@MessageBody() data: any) {
    this.server.emit('sync-delete-guild', data);
  }

  @SubscribeMessage('chat')
  handleMessage(@MessageBody() message: MessageDto) {
    this.server.emit('chat', message);
    this.messageService.addMessage(message);
  }
}
