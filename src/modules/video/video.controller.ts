import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { VideoService } from './video.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
  CreateVideoCallDto,
  VideoCallResponseDto,
  EndVideoCallDto,
} from './dto/video-call.dto';

@ApiTags('video')
@Controller('video')
export class VideoController {
  constructor(private videoService: VideoService) {}

  @ApiOperation({
    summary: 'Initiate a video call',
    description:
      'Create a new video call session in a channel. Returns call ID and session details.',
  })
  @ApiBody({
    type: CreateVideoCallDto,
    description: 'Video call creation details',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Video call created successfully',
    type: VideoCallResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - JWT token required',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('call/initiate')
  async initiateVideoCall(@Body() createVideoCallDto: CreateVideoCallDto) {
    const session = this.videoService.createVideoCall(
      createVideoCallDto.channelId,
      createVideoCallDto.callerId,
      createVideoCallDto.invitedUsers,
    );

    return {
      callId: session.callId,
      channelId: session.channelId,
      callerId: session.callerId,
      status: session.status,
      participants: session.participants,
      createdAt: session.createdAt,
    };
  }

  @ApiOperation({
    summary: 'Get video call details',
    description: 'Retrieve information about an active or recent video call',
  })
  @ApiParam({
    name: 'callId',
    description: 'The video call ID',
    example: 'call_1234567890_abc123',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Call details retrieved successfully',
    type: VideoCallResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Video call not found',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('call/:callId')
  async getVideoCall(@Param('callId') callId: string) {
    const session = this.videoService.getVideoCall(callId);

    if (!session) {
      return {
        statusCode: 404,
        message: 'Video call not found',
      };
    }

    return {
      callId: session.callId,
      channelId: session.channelId,
      callerId: session.callerId,
      status: session.status,
      participants: session.participants,
      createdAt: session.createdAt,
    };
  }

  @ApiOperation({
    summary: 'Activate a video call',
    description: 'Mark a pending video call as active',
  })
  @ApiParam({
    name: 'callId',
    description: 'The video call ID',
    example: 'call_1234567890_abc123',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Video call activated successfully',
    type: VideoCallResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Video call not found',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('call/:callId/activate')
  async activateVideoCall(@Param('callId') callId: string) {
    const session = this.videoService.activateVideoCall(callId);

    if (!session) {
      return {
        statusCode: 404,
        message: 'Video call not found',
      };
    }

    return {
      callId: session.callId,
      channelId: session.channelId,
      callerId: session.callerId,
      status: session.status,
      participants: session.participants,
      createdAt: session.createdAt,
    };
  }

  @ApiOperation({
    summary: 'End a video call',
    description: 'Terminate an active video call session',
  })
  @ApiBody({
    type: EndVideoCallDto,
    description: 'Call ID to end',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Video call ended successfully',
    type: VideoCallResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Video call not found',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('call')
  async endVideoCall(@Body() endVideoCallDto: EndVideoCallDto) {
    const session = this.videoService.endVideoCall(endVideoCallDto.callId);

    if (!session) {
      return {
        statusCode: 404,
        message: 'Video call not found',
      };
    }

    return {
      callId: session.callId,
      channelId: session.channelId,
      callerId: session.callerId,
      status: session.status,
      participants: session.participants,
      createdAt: session.createdAt,
    };
  }

  @ApiOperation({
    summary: 'Get active calls for a channel',
    description: 'Retrieve all active video calls in a specific channel',
  })
  @ApiParam({
    name: 'channelId',
    description: 'The channel ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of active calls retrieved successfully',
    type: [VideoCallResponseDto],
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('calls/channel/:channelId')
  async getActiveCallsForChannel(@Param('channelId') channelId: string) {
    const sessions = this.videoService.getActiveCallsForChannel(channelId);

    return sessions.map(session => ({
      callId: session.callId,
      channelId: session.channelId,
      callerId: session.callerId,
      status: session.status,
      participants: session.participants,
      createdAt: session.createdAt,
    }));
  }

  @ApiOperation({
    summary: 'Add participant to call',
    description: 'Add a user as a participant to an active video call',
  })
  @ApiParam({
    name: 'callId',
    description: 'The video call ID',
    example: 'call_1234567890_abc123',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: {
          type: 'string',
          example: '507f1f77bcf86cd799439013',
        },
      },
      required: ['userId'],
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Participant added successfully',
    type: VideoCallResponseDto,
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('call/:callId/add-participant')
  async addParticipant(
    @Param('callId') callId: string,
    @Body() body: { userId: string },
  ) {
    const session = this.videoService.addParticipant(callId, body.userId);

    if (!session) {
      return {
        statusCode: 404,
        message: 'Video call not found',
      };
    }

    return {
      callId: session.callId,
      channelId: session.channelId,
      callerId: session.callerId,
      status: session.status,
      participants: session.participants,
      createdAt: session.createdAt,
    };
  }

  @ApiOperation({
    summary: 'Remove participant from call',
    description: 'Remove a user from an active video call',
  })
  @ApiParam({
    name: 'callId',
    description: 'The video call ID',
    example: 'call_1234567890_abc123',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: {
          type: 'string',
          example: '507f1f77bcf86cd799439013',
        },
      },
      required: ['userId'],
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Participant removed successfully',
    type: VideoCallResponseDto,
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('call/:callId/remove-participant')
  async removeParticipant(
    @Param('callId') callId: string,
    @Body() body: { userId: string },
  ) {
    const session = this.videoService.removeParticipant(callId, body.userId);

    if (!session) {
      return {
        statusCode: 404,
        message: 'Video call not found',
      };
    }

    return {
      callId: session.callId,
      channelId: session.channelId,
      callerId: session.callerId,
      status: session.status,
      participants: session.participants,
      createdAt: session.createdAt,
    };
  }

  @ApiOperation({
    summary: 'Store WebRTC offer for a call',
    description: 'Store the SDP offer for a given callId',
  })
  @ApiParam({ name: 'callId', description: 'The video call ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { offer: { type: 'object' } },
      required: ['offer'],
    },
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('call/:callId/offer')
  async storeOffer(
    @Param('callId') callId: string,
    @Body() body: { offer: any },
  ) {
    const ok = this.videoService.storeOffer(callId, body.offer);
    if (!ok) {
      return { statusCode: 404, message: 'Video call not found' };
    }
    return { statusCode: 200, message: 'Offer stored' };
  }

  @ApiOperation({
    summary: 'Store WebRTC answer for a call',
    description: 'Store the SDP answer for a given callId',
  })
  @ApiParam({ name: 'callId', description: 'The video call ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { answer: { type: 'object' } },
      required: ['answer'],
    },
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('call/:callId/answer')
  async storeAnswer(
    @Param('callId') callId: string,
    @Body() body: { answer: any },
  ) {
    const ok = this.videoService.storeAnswer(callId, body.answer);
    if (!ok) {
      return { statusCode: 404, message: 'Video call not found' };
    }
    return { statusCode: 200, message: 'Answer stored' };
  }

  @ApiOperation({
    summary: 'Get stored offer for a call',
    description: 'Retrieve the stored SDP offer for a call',
  })
  @ApiParam({ name: 'callId', description: 'The video call ID' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('call/:callId/offer')
  async getOffer(@Param('callId') callId: string) {
    const offer = this.videoService.getOffer(callId);
    if (!offer) return { statusCode: 404, message: 'Offer not found' };
    return { offer };
  }

  @ApiOperation({
    summary: 'Get stored answer for a call',
    description: 'Retrieve the stored SDP answer for a call',
  })
  @ApiParam({ name: 'callId', description: 'The video call ID' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('call/:callId/answer')
  async getAnswer(@Param('callId') callId: string) {
    const answer = this.videoService.getAnswer(callId);
    if (!answer) return { statusCode: 404, message: 'Answer not found' };
    return { answer };
  }
}
