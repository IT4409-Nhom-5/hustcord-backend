import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { UserRole } from "../../common/enums/user-role.enum";
export type UserDocument = User & Document;


@Schema({ timestamps: true })
export class User {
  @ApiProperty()
  @Prop({ required: true, unique: true })
  email!: string;

  @ApiProperty()
  @Prop({ required: true })
  name!: string;

  @ApiProperty({ enum: UserRole, default: UserRole.USER })
  @Prop({ type: String, enum: UserRole, default: UserRole.USER })
  role?: UserRole;

  @ApiProperty({ default: false })
  @Prop({ default: false })
  isLocked?: boolean;

  @Prop()
  password?: string;

  @Prop()
  googleId?: string;

  @Prop()
  facebookId?: string;
  
}

export const UserSchema = SchemaFactory.createForClass(User);
