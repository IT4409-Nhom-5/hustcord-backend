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
    if(!user) throw new NotFoundException();
    const check = await bcrypt.compare(password, user.password);
    if(check){
      const {password, ... result} = user;
      return result;
    }
    return null;
  }

  async login({dataValues}) {
    const payload = {
      id: dataValues.id,
      username: dataValues.username,
      image: dataValues.image
    };
    return {
      statusCode: '200',
      access_token: this.jwtService.sign(payload),
      user: payload 
    };
  }

  async register(createUserDto: UserDto): Promise<any> {
    const user = await this.userService.findByEmail(createUserDto.email);
    if(user) throw new ConflictException('Email already exists');
    
    try {
      await this.userService.createUser(createUserDto);
      return {
        statusCode: '201',
        message: 'User created successfully.'
      }
    } catch (error: any) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new ConflictException('Username already exists');
      }
      throw error;
    }
  }
}