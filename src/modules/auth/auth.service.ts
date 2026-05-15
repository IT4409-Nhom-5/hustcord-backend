import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { UserService } from "../user/user.service";
import { JwtService } from "@nestjs/jwt";
import { UserDto } from "../user/dto/user.dto";
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService, private readonly jwtService: JwtService){}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findByEmail(email);
    if(!user) throw new NotFoundException('User not found');
    
    let check = false;
    try {
      check = await bcrypt.compare(password, user.password);
    } catch (e) {
      check = false;
    }
    
    if (check || password === user.password) {
      const plainUser = user.get({ plain: true });
      const {password, ... result} = plainUser;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = {
      id: user.id,
      username: user.username,
      image: user.image
    };
    const token = this.jwtService.sign(payload);
    return {
      statusCode: '200',
      message: 'Login successful',
      user: user, 
      access_token: token
    };
  }

  async register(createUserDto: UserDto): Promise<any> {
    const user = await this.userService.findByEmail(createUserDto.email);
    if(user) throw new ConflictException('User already exists');
    await this.userService.createUser(createUserDto);
    return {
      statusCode: '201',
      message: 'User created successfully.'
    }
  }
}