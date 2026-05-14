import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards, HttpStatus, Inject, forwardRef } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { MessageService } from './message.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { MessageDto } from './dto/message.dto';
import { ChannelGateway } from '../channel/channel.gateway';

@ApiTags('messages')
@Controller('messages')
export class MessageController {
  constructor(
    private messageService: MessageService,
    @Inject(forwardRef(() => ChannelGateway))
    private channelGateway: ChannelGateway,
  ) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getMessage(@Param('id') id: string) {
    const message = await this.messageService.getMessage({ id });
    return message;
  }

  @Get('channel/:id')
  async getMessagesByChannel(@Param('id') id: string) {
    const message = await this.messageService.getMessagesByChannel({ id });
    return message;
  }

  @Get('direct/:userId/:recipientId')
  async getDirectMessages(@Param('userId') userId: string, @Param('recipientId') recipientId: string) {
    const messages = await this.messageService.getDirectMessages({ userId, recipientId });
    return messages;
  }

  @Post('')
  async createMessage(@Body() body: MessageDto) {
    const result = await this.messageService.addMessage(body);

    // Phát tin nhắn qua Socket để bên kia thấy ngay (Dùng == hoặc so sánh với số 201)
    if (result.statusCode == 201 && result.data) {
      this.channelGateway.emitMessage(result.data);
    }

    return result;
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateMessage(@Param('id') id: string, @Body() body: MessageDto) {
    const result = await this.messageService.updateMessage({ id, message: body });
    return result;
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteMessage(@Param('id') id: string) {
    const result = await this.messageService.deleteMessage({ id });
    return result;
  }
}
