import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { VideoService } from './video.service';

@WebSocketGateway({ namespace: 'video', cors: true })
export class VideoGateway {
  @WebSocketServer()
  server: Server;

  private userSockets: Map<string, string> = new Map(); // userId -> socketId
  private socketToUser: Map<string, string> = new Map(); // socketId -> userId
  private userRooms: Map<string, string> = new Map(); // socketId -> channelId

  constructor(private videoService: VideoService) {}

  handleConnection(client: Socket) {
    console.log(`[Video] Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    const userId = this.socketToUser.get(client.id);
    const channelId = this.userRooms.get(client.id);

    if (userId && channelId) {
      console.log(`[Video] User ${userId} disconnected from room ${channelId}`);
      client.to(`voice-${channelId}`).emit('user-left-voice', { userId });
    }

    this.socketToUser.delete(client.id);
    this.userRooms.delete(client.id);
    if (userId) this.userSockets.delete(userId);
    console.log(`[Video] Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('register')
  handleRegister(
    @ConnectedSocket() client: Socket,
    @MessageBody() userId: string,
  ) {
    if (!userId) return;
    this.userSockets.set(userId, client.id);
    this.socketToUser.set(client.id, userId);
    console.log(`[Video] User ${userId} registered. Total online: ${this.userSockets.size}`);
  }

  @SubscribeMessage('video-call')
  handleVideoCall(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: any,
  ) {
    const { to, type, callId, from } = data;
    const toSocket = this.userSockets.get(to);
    
    
    if (toSocket) {
      this.server.to(toSocket).emit('video-call', { from, type, callId });
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
    const fromSocket = this.userSockets.get(from); // from là người gọi ban đầu

    if (fromSocket) {
      this.server.to(fromSocket).emit('call-accepted', {
        callId,
        from: to, // Người nghe gửi lại cho người gọi
        to: from,
      });
    } else {
    }
  }

  @SubscribeMessage('call-rejected')
  handleCallRejected(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    const { callId, to, from } = data;
    const fromSocket = this.userSockets.get(from);
    if (fromSocket) {
      this.server.to(fromSocket).emit('call-rejected', { callId, from: to, to: from });
    }
  }

  @SubscribeMessage('end-call')
  handleEndCall(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    const { callId, to, from } = data;
    const toSocket = this.userSockets.get(to) || this.userSockets.get(from);
    if (toSocket) {
      this.server.to(toSocket).emit('end-call', { callId, from });
    }
  }

  @SubscribeMessage('join-voice')
  handleJoinVoice(@ConnectedSocket() client: Socket, @MessageBody() data: { channelId: string; userId: string; username: string }) {
    const { channelId, userId, username } = data;
    client.join(`voice-${channelId}`);
    this.userRooms.set(client.id, channelId); // Lưu lại phòng user tham gia
    this.userSockets.set(userId, client.id);
    this.socketToUser.set(client.id, userId);

    client.to(`voice-${channelId}`).emit('user-joined-voice', { 
      userId, 
      username, 
      socketId: client.id,
      channelId
    });
    console.log(`[Voice] User ${username} joined room ${channelId}`);
  }

  @SubscribeMessage('leave-voice')
  handleLeaveVoice(@ConnectedSocket() client: Socket, @MessageBody() data: { channelId: string; userId: string }) {
    const { channelId, userId } = data;
    client.leave(`voice-${channelId}`);
    this.userRooms.delete(client.id);
    client.to(`voice-${channelId}`).emit('user-left-voice', { userId });
    console.log(`[Voice] User ${userId} left room ${channelId}`);
  }

  @SubscribeMessage('voice-signal')
  handleVoiceSignal(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: any,
  ) {
    const { to, signal, channelId } = data;
    const fromUserId = this.socketToUser.get(client.id);
    const fromId = fromUserId || data.from;

    // 1. Ưu tiên gửi đích danh (Point-to-Point)
    if (to) {
      const targetSocketId = this.userSockets.get(to) || to;
      this.server.to(targetSocketId).emit('voice-signal', { 
        ...data, 
        from: fromId,
        fromSocketId: client.id 
      });
      return;
    }

    // 2. Chỉ phát sóng cho cả phòng nếu không có người nhận cụ thể (Broadcast)
    if (channelId) {
      client.to(`voice-${channelId}`).emit('voice-signal', {
        ...data,
        from: fromId,
        fromSocketId: client.id
      });
    }
  }
}
