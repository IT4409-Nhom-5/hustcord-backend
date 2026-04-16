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
    public participants: string[];

    @Column(DataType.ARRAY(DataType.UUID()))
    public admin: string[];

    @Column(DataType.STRING)
    public description: string;

    @Column(DataType.ARRAY(DataType.UUID))
    public messages: string[];

    @Column(DataType.STRING(50))
    public name: string;

    @Column(DataType.STRING)
    public image: string;
}
