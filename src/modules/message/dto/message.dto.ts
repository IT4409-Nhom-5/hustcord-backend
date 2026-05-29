import { IsString, IsNotEmpty, IsArray, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MessageDto {
  @ApiProperty({ example: 'channel-uuid', required: false })
  @IsUUID()
  @IsOptional()
  channelId?: string;

  @ApiProperty({ example: 'user-uuid' })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ example: 'recipient-uuid', required: false })
  @IsUUID()
  @IsOptional()
  recipientId?: string;

  @ApiProperty({ example: 'Hello everyone!' })
  @IsString()
  @IsNotEmpty()
  text: string;

  @ApiProperty({ example: ['https://example.com/img.jpg'], required: false })
  @IsArray()
  @IsOptional()
  images?: string[];

  @ApiProperty({ example: 'parent-message-uuid', required: false })
  @IsUUID()
  @IsOptional()
  parentId?: string;
}
