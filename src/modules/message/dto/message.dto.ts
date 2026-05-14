import { IsString, IsOptional, IsArray, IsUUID } from 'class-validator';

export class MessageDto {
  @IsOptional()
  @IsUUID()
  channelId?: string;

  @IsUUID()
  userId: string;

  @IsOptional()
  @IsUUID()
  recipientId?: string;

  @IsString()
  text: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images: string[];
}
