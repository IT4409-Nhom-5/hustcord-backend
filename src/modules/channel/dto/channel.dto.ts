import { IsString, IsOptional, IsArray, IsUUID } from 'class-validator';

export class ChannelDto{
    @IsArray()
    @IsUUID('all', { each: true })
    participants:string[];

    @IsOptional()
    @IsArray()
    @IsUUID('all', { each: true })
    admins?:string[];

    @IsOptional()
    @IsString()
    image:string;

    @IsString()
    name:string;

    @IsOptional()
    @IsString()
    description:string;

    @IsOptional()
    @IsUUID()
    guildId?: string;
}