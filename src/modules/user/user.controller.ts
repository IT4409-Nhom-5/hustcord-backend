import { Body, Controller, Get, Param, Put, Post, Delete, UseGuards, HttpStatus, Request, ForbiddenException } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth, ApiBody } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { UserService } from "./user.service";
import { UserDto } from "./dto/user.dto";

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @ApiOperation({
    summary: 'Get user by ID',
    description: 'Retrieve user information by their ID',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User retrieved successfully',
    type: UserDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
  })
  @Get(':id')
  async getUser(@Param('id') id: string) {
    return await this.userService.findById(id);
  }

  @ApiOperation({
    summary: 'Update user profile',
    description: 'Update user information. User must be authenticated.',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({
    type: UserDto,
    description: 'Updated user information',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User updated successfully',
    type: UserDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - JWT token required',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() body: UserDto,
    @Request() req: any,
  ) {
    if (req.user.id !== id) {
      throw new ForbiddenException('Cannot update other user profile');
    }
    return await this.userService.updateUser({ ...body, id });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id/friends')
  async getFriends(@Param('id') id: string) {
    return await this.userService.getFriends({ id });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/friends/:otherId')
  async addFriend(
    @Param('id') id: string,
    @Param('otherId') otherId: string,
    @Request() req: any,
  ) {
    if (req.user.id !== id) {
      throw new ForbiddenException('Cannot modify other user friends');
    }
    return await this.userService.setFriend({ id, otherId, status: true });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id/friends/:otherId')
  async removeFriend(
    @Param('id') id: string,
    @Param('otherId') otherId: string,
    @Request() req: any,
  ) {
    if (req.user.id !== id) {
      throw new ForbiddenException('Cannot modify other user friends');
    }
    return await this.userService.setFriend({ id, otherId, status: false });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id/requests')
  async getRequests(@Param('id') id: string, @Request() req: any) {
    if (req.user.id !== id) {
      throw new ForbiddenException('Cannot view other user requests');
    }
    return await this.userService.getRequests({ id });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/requests/:otherId')
  async sendFriendRequest(
    @Param('id') id: string,
    @Param('otherId') otherId: string,
    @Request() req: any,
  ) {
    if (req.user.id !== id) {
      throw new ForbiddenException('Cannot send request from other user');
    }
    return await this.userService.setRequest({ id, otherId, status: true });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id/requests/:otherId')
  async cancelFriendRequest(
    @Param('id') id: string,
    @Param('otherId') otherId: string,
    @Request() req: any,
  ) {
    if (req.user.id !== id) {
      throw new ForbiddenException('Cannot cancel request from other user');
    }
    return await this.userService.setRequest({ id, otherId, status: false });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id/blocked')
  async getBlocked(@Param('id') id: string, @Request() req: any) {
    if (req.user.id !== id) {
      throw new ForbiddenException('Cannot view other user blocked list');
    }
    return await this.userService.getBlocked({ id });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/blocked/:otherId')
  async blockUser(
    @Param('id') id: string,
    @Param('otherId') otherId: string,
    @Request() req: any,
  ) {
    if (req.user.id !== id) {
      throw new ForbiddenException('Cannot block from other user');
    }
    return await this.userService.setBlocked({ id, otherId, status: true });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id/blocked/:otherId')
  async unblockUser(
    @Param('id') id: string,
    @Param('otherId') otherId: string,
    @Request() req: any,
  ) {
    if (req.user.id !== id) {
      throw new ForbiddenException('Cannot unblock from other user');
    }
    return await this.userService.setBlocked({ id, otherId, status: false });
  }
}