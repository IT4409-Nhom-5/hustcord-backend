import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { VideoService } from './video.service';

// Khớp cả "/video" và "//video". Frontend dựng URL là `${VITE_API_URL}/video`,
// mà VITE_API_URL có dấu "/" ở cuối -> client deployed kết nối vào namespace
// "//video", còn dev local (không có "/" cuối) thì vào "/video". Regex này
// nhận cả hai; các client cùng URL sẽ ở chung một namespace nên vẫn thấy nhau.
@WebSocketGateway({ namespace: /^\/+video$/, cors: true })
export class VideoGateway {
  @WebSocketServer()
  server: Server;

  private userSockets: Map<string, string> = new Map(); // userId -> socketId
  private socketRooms: Map<string, Set<string>> = new Map(); // socketId -> Set<channelId>

  constructor(private videoService: VideoService) {}

  handleConnection(client: Socket) {
    console.log(`[Video] Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`[Video] Client disconnected: ${client.id}`);
    let disconnectedUserId: string | null = null;
    for (const [userId, socketId] of this.userSockets.entries()) {
      if (socketId === client.id) {
        disconnectedUserId = userId;
        this.userSockets.delete(userId);
        break;
      }
    }

    const rooms = this.socketRooms.get(client.id);
    if (rooms && disconnectedUserId) {
      for (const channelId of rooms) {
        client.to(channelId).emit('user-left-voice', {
          userId: disconnectedUserId,
        });
      }
      this.socketRooms.delete(client.id);
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
        type: data.type,
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
        from: to, // The peer who accepted (B)
        to: from, // The peer who initiated (A)
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
        from: to, // The peer who rejected (B)
        to: from, // The peer who initiated (A)
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

  @SubscribeMessage('join-voice')
  handleJoinVoice(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { channelId: string; userId: string; username: string },
  ) {
    const { channelId, userId, username } = data;
    client.join(channelId);

    this.userSockets.set(userId, client.id);

    let rooms = this.socketRooms.get(client.id);
    if (!rooms) {
      rooms = new Set();
      this.socketRooms.set(client.id, rooms);
    }
    rooms.add(channelId);

    client.to(channelId).emit('user-joined-voice', {
      userId,
      username,
      socketId: client.id,
      channelId,
    });

    console.log(`[Video] User ${username} (${userId}) joined voice room ${channelId}`);
  }

  @SubscribeMessage('leave-voice')
  handleLeaveVoice(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { channelId: string; userId: string },
  ) {
    const { channelId, userId } = data;
    client.leave(channelId);

    const rooms = this.socketRooms.get(client.id);
    if (rooms) {
      rooms.delete(channelId);
      if (rooms.size === 0) {
        this.socketRooms.delete(client.id);
      }
    }

    client.to(channelId).emit('user-left-voice', {
      userId,
    });

    console.log(`[Video] User ${userId} left voice room ${channelId}`);
  }

  @SubscribeMessage('voice-signal')
  handleVoiceSignal(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: any,
  ) {
    const { to, channelId } = data;
    const payload = {
      ...data,
      fromSocketId: client.id,
    };

    if (to) {
      const toSocket = this.userSockets.get(to);
      if (toSocket) {
        this.server.to(toSocket).emit('voice-signal', payload);
      } else {
        this.server.to(to).emit('voice-signal', payload);
      }
    } else if (channelId) {
      client.to(channelId).emit('voice-signal', payload);
    }
  }
}
