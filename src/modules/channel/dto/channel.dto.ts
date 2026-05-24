import { IsArray, IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChannelDto {
  @ApiProperty({ example: ['user-id-1', 'user-id-2'] })
  @IsArray()
  @IsNotEmpty()
  participants: string[];

  @ApiProperty({ example: ['admin-id-1'], required: false })
  @IsArray()
  @IsOptional()
  admins?: string[];

  @ApiProperty({ example: 'https://example.com/image.jpg' })
  @IsString()
  @IsNotEmpty()
  image: string;

  @ApiProperty({ example: 'General Chat' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Channel for general discussions' })
  @IsString()
  @IsNotEmpty()
  description: string;
}