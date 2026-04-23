import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateVideoCallDto {
  @ApiProperty({
    description: 'ID of the channel where the call is initiated',
    example: '507f1f77bcf86cd799439011',
  })
  @IsString()
  @IsNotEmpty()
  channelId: string;

  @ApiProperty({
    description: 'ID of the user initiating the call',
    example: '507f1f77bcf86cd799439012',
  })
  @IsString()
  @IsNotEmpty()
  callerId: string;

  @ApiPropertyOptional({
    description: 'List of user IDs to invite to the call',
    example: ['507f1f77bcf86cd799439013', '507f1f77bcf86cd799439014'],
  })
  @IsOptional()
  invitedUsers?: string[];
}

export class VideoCallResponseDto {
  @ApiProperty({
    description: 'Unique video call session ID',
    example: '507f1f77bcf86cd799439015',
  })
  callId: string;

  @ApiProperty({
    description: 'Channel ID',
    example: '507f1f77bcf86cd799439011',
  })
  channelId: string;

  @ApiProperty({
    description: 'Caller user ID',
    example: '507f1f77bcf86cd799439012',
  })
  callerId: string;

  @ApiProperty({
    description: 'Current call status',
    example: 'active',
    enum: ['pending', 'active', 'ended'],
  })
  status: 'pending' | 'active' | 'ended';

  @ApiProperty({
    description: 'Timestamp when call was created',
    example: '2026-04-23T10:00:00Z',
  })
  createdAt: string;

  @ApiPropertyOptional({
    description: 'List of participants in the call',
    example: ['507f1f77bcf86cd799439012', '507f1f77bcf86cd799439013'],
  })
  participants?: string[];
}

export class EndVideoCallDto {
  @ApiProperty({
    description: 'Video call ID to end',
    example: '507f1f77bcf86cd799439015',
  })
  @IsString()
  @IsNotEmpty()
  callId: string;
}

export class VideoOfferDto {
  @ApiProperty({
    description: 'Video call ID',
    example: '507f1f77bcf86cd799439015',
  })
  @IsString()
  @IsNotEmpty()
  callId: string;

  @ApiProperty({
    description: 'User ID sending the offer',
    example: '507f1f77bcf86cd799439012',
  })
  @IsString()
  @IsNotEmpty()
  from: string;

  @ApiProperty({
    description: 'User ID receiving the offer',
    example: '507f1f77bcf86cd799439013',
  })
  @IsString()
  @IsNotEmpty()
  to: string;

  @ApiProperty({
    description: 'WebRTC SDP offer',
    example: 'v=0\r\no=...',
  })
  @IsString()
  @IsNotEmpty()
  offer: string;
}

export class VideoAnswerDto {
  @ApiProperty({
    description: 'Video call ID',
    example: '507f1f77bcf86cd799439015',
  })
  @IsString()
  @IsNotEmpty()
  callId: string;

  @ApiProperty({
    description: 'User ID sending the answer',
    example: '507f1f77bcf86cd799439013',
  })
  @IsString()
  @IsNotEmpty()
  from: string;

  @ApiProperty({
    description: 'User ID who sent the offer',
    example: '507f1f77bcf86cd799439012',
  })
  @IsString()
  @IsNotEmpty()
  to: string;

  @ApiProperty({
    description: 'WebRTC SDP answer',
    example: 'v=0\r\no=...',
  })
  @IsString()
  @IsNotEmpty()
  answer: string;
}

export class IceCandidateDto {
  @ApiProperty({
    description: 'Video call ID',
    example: '507f1f77bcf86cd799439015',
  })
  @IsString()
  @IsNotEmpty()
  callId: string;

  @ApiProperty({
    description: 'User ID sending the candidate',
    example: '507f1f77bcf86cd799439012',
  })
  @IsString()
  @IsNotEmpty()
  from: string;

  @ApiProperty({
    description: 'User ID receiving the candidate',
    example: '507f1f77bcf86cd799439013',
  })
  @IsString()
  @IsNotEmpty()
  to: string;

  @ApiProperty({
    description: 'ICE candidate data',
    example: 'candidate:...',
  })
  @IsString()
  @IsNotEmpty()
  candidate: string;
}
