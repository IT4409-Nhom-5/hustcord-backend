import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { MessageService } from '../message/message.service';
import { MessageDto } from './dto/message.dto';

@WebSocketGateway({ cors: true })
export class ChannelGateway {
  constructor(private messageService: MessageService) {}

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('chat')
  handleMessage(@MessageBody() message: any) {
    this.server.emit('MESSAGE_CREATE', message);
  }

  emitMessage(message: any) {
    if (this.server) {
      this.server.emit('MESSAGE_CREATE', message);
    } else {
      console.warn('[WS] Server not initialized yet');
    }
  }

  emitMessageUpdate(message: any) {
    if (this.server) {
      this.server.emit('MESSAGE_UPDATE', message);
    } else {
      console.warn('[WS] Server not initialized yet');
    }
  }
}
