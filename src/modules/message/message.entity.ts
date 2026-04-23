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
    public channelId: string;

    @BelongsTo(() => Channel)
    public channel: Channel;

    @ForeignKey(() => User)
    @Column(DataType.UUID)
    public userId: string;

    @BelongsTo(() => User)
    public user: User;

    @Column(DataType.STRING)
    public text: string;

    @Column(DataType.ARRAY(DataType.STRING))
    public images: string[];
}