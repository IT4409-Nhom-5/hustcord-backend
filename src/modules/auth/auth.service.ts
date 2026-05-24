import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { UserService } from "../user/user.service";
import { JwtService } from "@nestjs/jwt";
import { UserDto } from "../user/dto/user.dto";
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService, private readonly jwtService: JwtService) { }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findByEmail(email);

    if (!user) {
      console.log('User not found');
      return null;
    }

    // console.log('User found, comparing password...');   // debug

    const isMatch = await bcrypt.compare(password, user.password);

    // console.log('Password match result:', isMatch);     // debug quan trọng

    if (!isMatch) {
      console.log('Invalid password');
      return null;
    }

    const userData = user.get({ plain: true });
    const { password: _, ...result } = userData;
    return result;
  }

  async login(user: any) {
    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      image: user.image
    };

    return {
      statusCode: '200',
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        image: user.image,
      }
    };
  }

  async register(createUserDto: UserDto): Promise<any> {
    const user = await this.userService.findByEmail(createUserDto.email);

    if (user) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    await this.userService.createUser({
      ...createUserDto,
      password: hashedPassword,
    });

    return {
      statusCode: '201',
      message: 'User created successfully.',
    };
  }
}