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

  @SubscribeMessage('chat')
  handleMessage(@MessageBody() message: MessageDto) {
    this.server.emit('chat', message);
    this.messageService.addMessage(message);
  }
}
