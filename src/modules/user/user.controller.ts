import { Body, Controller, Get, Param, Post, Put, UseGuards, HttpStatus } from "@nestjs/common";
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
  @Get('search/:username')
  async searchUser(@Param('username') username: string) {
    return await this.userService.findBySearch(username);
  }

  @Get(':id/friends')
  async getFriends(@Param('id') id: string) {
    return await this.userService.getFriends({ id });
  }

  @Post('friend')
  @UseGuards(JwtAuthGuard)
  async setFriend(@Body() body: { id: string, otherId: string, status: boolean }) {
    return await this.userService.setFriend(body);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateUser(@Param('id') id: string, @Body() body: UserDto) {
    return await this.userService.updateUser({ ...body, id });
  }
}