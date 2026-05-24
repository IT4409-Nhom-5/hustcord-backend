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

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
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
  deleteChannel(@Param('id') id: string) {
    return this.adminService.deleteChannel(id);
  }

  // ================= MESSAGES =================

  @Delete('messages/:id')
  deleteMessage(@Param('id') id: string) {
    return this.adminService.deleteMessage(id);
  }
}