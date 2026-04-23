import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { VideoService } from './video.service';

@WebSocketGateway({ namespace: 'video', cors: true })
export class VideoGateway {
  @WebSocketServer()
  server: Server;

  private userSockets: Map<string, string> = new Map(); // userId -> socketId

  constructor(private videoService: VideoService) {}

  handleConnection(client: Socket) {
    console.log(`[Video] Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`[Video] Client disconnected: ${client.id}`);
    for (const [userId, socketId] of this.userSockets.entries()) {
      if (socketId === client.id) {
        this.userSockets.delete(userId);
        break;
      }
    }
  }

  @SubscribeMessage('register')
  handleRegister(
    @ConnectedSocket() client: Socket,
    @MessageBody() userId: string,
  ) {
    this.userSockets.set(userId, client.id);
    console.log(`[Video] User ${userId} registered with socket ${client.id}`);
    client.emit('registered', { userId });
  }

  @SubscribeMessage('video-call')
  handleVideoCall(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: any,
  ) {
    const { callId, to } = data;
    const toSocket = this.userSockets.get(to);

    if (toSocket) {
      this.server.to(toSocket).emit('incoming-call', {
        callId,
        from: data.from,
        channelId: data.channelId,
      });
      console.log(`[Video] Call ${callId} initiated to user ${to}`);
    } else {
      client.emit('error', { message: `User ${to} is not online` });
    }
  }

  @SubscribeMessage('call-accepted')
  handleCallAccepted(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: any,
  ) {
    const { callId, to, from } = data;
    const fromSocket = this.userSockets.get(from);

    if (fromSocket) {
      this.server.to(fromSocket).emit('call-accepted', {
        callId,
        from,
        to,
      });
      console.log(`[Video] Call ${callId} accepted by user ${to}`);
    }
  }

  @SubscribeMessage('call-rejected')
  handleCallRejected(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: any,
  ) {
    const { callId, to, from } = data;
    const fromSocket = this.userSockets.get(from);

    if (fromSocket) {
      this.server.to(fromSocket).emit('call-rejected', {
        callId,
        from,
        to,
      });
      console.log(`[Video] Call ${callId} rejected by user ${to}`);
    }
  }

  @SubscribeMessage('offer')
  handleOffer(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: any,
  ) {
    const { callId, to, from, offer } = data;
    const toSocket = this.userSockets.get(to);

    this.videoService.storeOffer(callId, offer);

    if (toSocket) {
      this.server.to(toSocket).emit('offer', {
        callId,
        from,
        offer,
      });
      console.log(`[Video] Offer sent for call ${callId}`);
    }
  }

  @SubscribeMessage('answer')
  handleAnswer(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: any,
  ) {
    const { callId, to, from, answer } = data;
    const toSocket = this.userSockets.get(to);

    this.videoService.storeAnswer(callId, answer);

    if (toSocket) {
      this.server.to(toSocket).emit('answer', {
        callId,
        from,
        answer,
      });
      console.log(`[Video] Answer sent for call ${callId}`);
    }
  }

  @SubscribeMessage('ice-candidate')
  handleIceCandidate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: any,
  ) {
    const { callId, to, from, candidate } = data;
    const toSocket = this.userSockets.get(to);

    if (toSocket) {
      this.server.to(toSocket).emit('ice-candidate', {
        callId,
        from,
        candidate,
      });
    }
  }

  @SubscribeMessage('end-call')
  handleEndCall(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: any,
  ) {
    const { callId, to, from } = data;
    const toSocket = this.userSockets.get(to);

    if (toSocket) {
      this.server.to(toSocket).emit('call-ended', {
        callId,
        from,
      });
    }

    console.log(`[Video] Call ${callId} ended`);
  }
}
