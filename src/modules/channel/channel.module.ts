import { Module } from "@nestjs/common";
import { MessageModule } from "../message/message.module";
import { ChannelController } from "./channel.controller";
import { ChannelGateway } from "./channel.gateway";
import { ChannelProvider } from "./channel.provider";
import { ChannelService } from "./channel.service";
@Module({
    imports:[MessageModule],
    controllers:[ChannelController],
    providers:[ChannelService, ChannelGateway,...ChannelProvider],
    exports:[ChannelService]
})

export class ChannelModule {};