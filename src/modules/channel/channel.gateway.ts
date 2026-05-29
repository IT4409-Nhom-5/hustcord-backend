import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessageService } from '../message/message.service';
import { MessageDto } from './dto/message.dto';
import { Channel } from './channel.entity';
import { User } from '../user/user.entity';

@WebSocketGateway({ cors: true })
export class ChannelGateway {
  private userSockets: Map<string, string> = new Map(); // userId -> socketId

  constructor(private messageService: MessageService) {}

  @WebSocketServer()
  server: Server;

  handleDisconnect(client: Socket) {
    for (const [userId, socketId] of this.userSockets.entries()) {
      if (socketId === client.id) {
        this.userSockets.delete(userId);
        console.log(`[Channel] User ${userId} disconnected from main socket`);
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
    console.log(`[Channel] User ${userId} registered with socket ${client.id}`);
  }

  @SubscribeMessage('sync-guild')
  async handleSyncGuild(
    @ConnectedSocket() client: Socket,
    @MessageBody() guild: any,
  ) {
    try {
      console.log(`[Channel] Received sync-guild for guild ${guild.id}`);
      // Find the general channel for this guild in the DB to extract the participants list
      const channel = await Channel.findOne({
        where: { guildId: guild.id }
      });
      if (!channel) {
        console.warn(`[Channel] No general channel found for guildId ${guild.id}`);
        return;
      }

      const participants = channel.participants || [];
      const ownerId = guild.ownerId;

      // Resolve user profiles for members list
      const members: any[] = [];
      for (const pId of participants) {
        const user = await User.findByPk(pId, {
          attributes: ['id', 'username', 'email', 'image']
        });
        if (user) {
          members.push({
            id: user.id,
            username: user.username,
            email: user.email,
            avatar: user.image || undefined
          });
        }
      }

      // Reconstruct complete guild payload
      const fullGuild = {
        ...guild,
        members
      };

      // Broadcast GUILD_CREATE to all online participants (friends) except the owner
      for (const memberId of participants) {
        if (memberId === ownerId) continue;
        const socketId = this.userSockets.get(memberId);
        if (socketId) {
          this.server.to(socketId).emit('GUILD_CREATE', fullGuild);
          console.log(`[Channel] Broadcast GUILD_CREATE to user ${memberId} via socket ${socketId}`);
        }
      }
    } catch (err) {
      console.error('[ChannelGateway] Error in sync-guild handler:', err);
    }
  }

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

  emitChannelCreate(channel: any, participants: string[]) {
    if (this.server) {
      console.log(`[Channel] Broadcasting CHANNEL_CREATE for channel ${channel.id} to participants`);
      for (const userId of participants) {
        const socketId = this.userSockets.get(userId);
        if (socketId) {
          this.server.to(socketId).emit('CHANNEL_CREATE', channel);
          console.log(`[Channel] Emitted CHANNEL_CREATE to user ${userId} via socket ${socketId}`);
        }
      }
    } else {
      console.warn('[WS] Server not initialized yet');
    }
  }

  emitChannelDelete(channelId: string, guildId: string, participants: string[]) {
    if (this.server) {
      console.log(`[Channel] Broadcasting CHANNEL_DELETE for channel ${channelId} to participants`);
      for (const userId of participants) {
        const socketId = this.userSockets.get(userId);
        if (socketId) {
          this.server.to(socketId).emit('CHANNEL_DELETE', { id: channelId, guildId });
          console.log(`[Channel] Emitted CHANNEL_DELETE to user ${userId} via socket ${socketId}`);
        }
      }
    } else {
      console.warn('[WS] Server not initialized yet');
    }
  }

  emitGuildDelete(guildId: string, participants: string[]) {
    if (this.server) {
      console.log(`[Channel] Broadcasting GUILD_DELETE for guild ${guildId} to participants`);
      for (const userId of participants) {
        const socketId = this.userSockets.get(userId);
        if (socketId) {
          this.server.to(socketId).emit('GUILD_DELETE', { guildId });
          console.log(`[Channel] Emitted GUILD_DELETE to user ${userId} via socket ${socketId}`);
        }
      }
    } else {
      console.warn('[WS] Server not initialized yet');
    }
  }
}
