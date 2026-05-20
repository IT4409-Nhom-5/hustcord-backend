import {
  Table,
  Column,
  Model,
  PrimaryKey,
  HasMany,
  DataType,
  Default,
  BeforeCreate,
  Unique,
  BeforeUpdate
} from 'sequelize-typescript';
import * as bcrypt from 'bcryptjs';


@Table({ createdAt: false, updatedAt: false })
export class User extends Model {
    @PrimaryKey
    @Default(DataType.UUIDV4())
    @Column(DataType.UUID())
    declare id: string;  /* ko dung public vi Model co san id */

    @Unique
    @Column(DataType.STRING('100'))
    declare email: string;

    @Unique
    @Column(DataType.STRING('20'))
    declare username: string;

    @Column(DataType.STRING)
    declare password: string;

    @Column(DataType.STRING)
    declare about: string;

    @Default('https://res.cloudinary.com/dtzs4c2uv/image/upload/v1666326774/noavatar_rxbrbk.png')
    @Column(DataType.STRING)
    declare image: string;

    @Column(DataType.ARRAY(DataType.UUID))
    declare friends: Array<string>;

    @Column(DataType.ARRAY(DataType.UUID))
    declare blocked: Array<string>;

    @Column(DataType.ARRAY(DataType.UUID))
    declare requests: Array<string>;

    // /* truoc khi luu user vao DB thi encrypt pw  -- dang loi o day nen doi co che hash trong service*/
    // @BeforeCreate
    // // @BeforeUpdate // chua can do dang test
    // static async hashPassword(user: User) {
    //     if(user) {
    //         const salt = await bcrypt.genSalt(10);
    //         const hashedPassword = await bcrypt.hash(user.getDataValue('password'), salt);
    //         return user.setDataValue('password', hashedPassword);
    //     }
    // }
}