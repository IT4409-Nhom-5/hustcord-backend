import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { MessageService } from './message.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { MessageDto } from './dto/message.dto';

@ApiTags('messages')
@Controller('messages')
export class MessageController {
  constructor(private messageService: MessageService) {}

  @ApiOperation({
    summary: 'Get message by ID',
    description: 'Retrieve a specific message by its ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Message ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Message retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Message not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - JWT token required',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getMessage(@Param('id') id: string) {
    const message = await this.messageService.getMessage({ id });
    return message;
  }

  @ApiOperation({
    summary: 'Get messages by channel',
    description: 'Retrieve all messages in a specific channel',
  })
  @ApiParam({
    name: 'id',
    description: 'Channel ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Messages retrieved successfully',
    isArray: true,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Channel not found',
  })
  @Get('channel/:id')
  async getMessagesByChannel(@Param('id') id: string) {
    const message = await this.messageService.getMessagesByChannel({ id });
    return message;
  }

  @ApiOperation({
    summary: 'Create a new message',
    description: 'Post a new message to a channel',
  })
  @ApiBody({
    type: MessageDto,
    description: 'Message content',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Message created successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid message data',
  })
  @Post('')
  async createMessage(@Body() body: MessageDto) {
    const result = await this.messageService.addMessage(body);
    return result;
  }

  @ApiOperation({
    summary: 'Update a message',
    description: 'Update an existing message content',
  })
  @ApiParam({
    name: 'id',
    description: 'Message ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({
    type: MessageDto,
    description: 'Updated message content',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Message updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Message not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - JWT token required',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateMessage(@Param('id') id: string, @Body() body: MessageDto) {
    const result = await this.messageService.updateMessage({ id, message: body });
    return result;
  }

  @ApiOperation({
    summary: 'Delete a message',
    description: 'Delete a message from a channel',
  })
  @ApiParam({
    name: 'id',
    description: 'Message ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Message deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Message not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - JWT token required',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteMessage(@Param('id') id: string) {
    const result = await this.messageService.deleteMessage({ id });
    return result;
  }
}
