import { Body, Controller, Get, Param, Post, UseGuards, Delete, Put, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ChannelService } from './channel.service';
import { ChannelDto } from './dto/channel.dto';

@ApiTags('channels')
@Controller('channels')
export class ChannelController {
  constructor(private channelService: ChannelService) {}

  @ApiOperation({
    summary: 'Get channel by ID',
    description: 'Retrieve channel details by its ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Channel ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Channel retrieved successfully',
    type: ChannelDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Channel not found',
  })
  @Get(':id')
  async getChannel(@Param('id') id: string) {
    const channel = await this.channelService.getChannel(id);
    return channel;
  }

  @ApiOperation({
    summary: 'Get channels by user',
    description: 'Retrieve all channels that a user is a member of',
  })
  @ApiParam({
    name: 'userId',
    description: 'User ID',
    example: '507f1f77bcf86cd799439012',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User channels retrieved successfully',
    type: [ChannelDto],
  })
  @Get('user/:userId')
  async getChannelByUserId(@Param('userId') userId: string) {
    const channels = await this.channelService.getChannelsByUser(userId);
    return channels;
  }

  @ApiOperation({
    summary: 'Create a new channel',
    description: 'Create a new channel. User must be authenticated.',
  })
  @ApiBody({
    type: ChannelDto,
    description: 'Channel creation details',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Channel created successfully',
    type: ChannelDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid channel data',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - JWT token required',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('')
  async createChannel(@Body() body: ChannelDto) {
    const result = await this.channelService.createChannel(body);
    return result;
  }

  @ApiOperation({
    summary: 'Update a channel',
    description: 'Update channel information',
  })
  @ApiParam({
    name: 'id',
    description: 'Channel ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({
    type: ChannelDto,
    description: 'Updated channel information',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Channel updated successfully',
    type: ChannelDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Channel not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - JWT token required',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateChannel(@Param('id') id: string, @Body() body: ChannelDto) {
    const result = await this.channelService.updateChannel({ id, channel: body });
    return result;
  }

  @ApiOperation({
    summary: 'Delete a channel',
    description: 'Delete a channel and all associated messages',
  })
  @ApiParam({
    name: 'id',
    description: 'Channel ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Channel deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Channel not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - JWT token required',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteChannel(@Param('id') id: string) {
    const result = await this.channelService.deleteChannel(id);
    return result;
  }
}
