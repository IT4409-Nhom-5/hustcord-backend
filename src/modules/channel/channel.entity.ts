import {
  Table,
  Column,
  Model,
  PrimaryKey,
  HasMany,
  DataType,
  Default,
  BeforeCreate,
  Unique
} from 'sequelize-typescript';

@Table
export class Channel extends Model {
    @PrimaryKey
    @Default(DataType.UUIDV4())
    @Column(DataType.UUID())
    declare id: string;

    @Column(DataType.ARRAY(DataType.UUID()))
    declare participants: string[];

    @Column(DataType.ARRAY(DataType.UUID()))
    declare admins: string[];

    @Column(DataType.STRING)
    declare description: string;

    @Column(DataType.ARRAY(DataType.UUID))
    declare messages: string[];

    @Column(DataType.STRING)
    declare name: string;

    @Column(DataType.STRING)
    declare image: string;

    @Column(DataType.UUID)
    declare guildId: string;
}
