import { BelongsTo, Column, DataType, Default, ForeignKey, Model, PrimaryKey, Table } from "sequelize-typescript";
import { Channel } from "../channel/channel.entity";
import { User } from "../user/user.entity";

@Table({ updatedAt: false })
export class Message extends Model {
    @PrimaryKey
    @Default(DataType.UUIDV1())
    @Column(DataType.UUID)
    declare id: string;

    @ForeignKey(() => Channel)
    @Column(DataType.UUID)
    declare channelId: string;

    @BelongsTo(() => Channel)
    declare channel: Channel;

    @ForeignKey(() => User)
    @Column(DataType.UUID)
    declare userId: string;

    @BelongsTo(() => User, { foreignKey: 'userId', as: 'user' })
    declare user: User;

    @ForeignKey(() => User)
    @Column(DataType.UUID)
    declare recipientId: string;

    @BelongsTo(() => User, { foreignKey: 'recipientId', as: 'recipient' })
    declare recipient: User;

    @Column(DataType.STRING)
    declare text: string;

    @Column(DataType.ARRAY(DataType.STRING))
    declare images: string[];
}