import {
  Controller,
  Get,
  Delete,
  Param,
  Patch,
  Body,
  UseGuards,
} from '@nestjs/common';

import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';
import { ChannelGateway } from '../channel/channel.gateway';
import { Channel } from '../channel/channel.entity';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly channelGateway: ChannelGateway,
  ) {}

  // ================= DASHBOARD =================

  @Get('dashboard')
  dashboard() {
    return this.adminService.dashboard();
  }

  // ================= USERS =================

  @Get('users')
  getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Delete('users/:id')
  deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }

  @Patch('users/:id/role')
  changeUserRole(
    @Param('id') id: string,
    @Body('role') role: 'user' | 'admin',
  ) {
    return this.adminService.changeUserRole(
      id,
      role,
    );
  }

  // ================= CHANNELS =================

  @Get('channels')
  getAllChannels() {
    return this.adminService.getAllChannels();
  }

  @Delete('channels/:id')
  async deleteChannel(@Param('id') id: string) {
    const channel = await Channel.findByPk(id);
    const result = await this.adminService.deleteChannel(id);

    if (channel) {
      if (channel.participants && channel.participants.length > 0) {
        // General channel (Guild)
        const participants = channel.participants || [];
        this.channelGateway.emitGuildDelete(channel.guildId, participants);
      } else {
        // Sub-channel
        const generalChannel = await Channel.findOne({
          where: { guildId: channel.guildId }
        });
        if (generalChannel) {
          const participants = generalChannel.participants || [];
          this.channelGateway.emitChannelDelete(channel.id, channel.guildId, participants);
        }
      }
    }

    return result;
  }

  // ================= MESSAGES =================

  @Delete('messages/:id')
  deleteMessage(@Param('id') id: string) {
    return this.adminService.deleteMessage(id);
  }
}