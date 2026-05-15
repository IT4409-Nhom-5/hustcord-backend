import { Channel } from "./channel.entity";

export const ChannelProvider = [
    {
        provide: 'CHANNEL_REPOSITORY',
        useFactory: () => Channel,
        inject: ['SEQUELIZE'],
    }
];