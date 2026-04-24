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
    declare admin: string[];

    @Column(DataType.STRING)
    declare description: string;

    @Column(DataType.ARRAY(DataType.UUID))
    declare messages: string[];

    @Column(DataType.STRING(50))
    declare name: string;

    @Column(DataType.STRING)
    declare image: string;
}
