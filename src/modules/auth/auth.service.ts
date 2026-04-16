import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../user/user.schema';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { SignOptions } from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<UserDocument | null> {
    const user = await this.userModel.findOne({ email }).exec();
    if (user && user.password && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    return null;
  }

  async login(user: UserDocument) {
    const tokens = await this.generateToken(user);
    return {
      ...tokens,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        isLocked: user.isLocked,
      },
    };
  }

  async register(email: string, name: string, password: string) {
    const existing = await this.userModel.findOne({ email }).exec();
    if (existing) {
      throw new UnauthorizedException('Email already exists');
    }

    const hash = await bcrypt.hash(password, 10);
    const user = new this.userModel({ email, name, password: hash });
    await user.save();

    return this.login(user);
  }

  async generateToken(user: any) {
    const payload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
      isLocked: user.isLocked,
    };

    const accessTokenOptions: any = {
      expiresIn: this.configService.get<string>('jwt.expiresIn') || '45m',
    };

    const refreshTokenOptions: any = {
      expiresIn: this.configService.get<string>('jwtRefresh.expiresIn') || '7d',
    };

    const accessToken = jwt.sign(
      payload,
      this.configService.get<string>('jwt.secret') || 'supersecret',
      accessTokenOptions,
    );

    const refreshToken = jwt.sign(
      payload,
      this.configService.get<string>('jwtRefresh.secret') || 'superrefreshsecret',
      refreshTokenOptions,
    );

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async refreshToken(user: any) {
    return this.generateToken(user);
  }

  async getProfileById(userId: string) {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      isLocked: user.isLocked,
    };
  }
}