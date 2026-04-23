import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from '../../common/guards/local-auth.guard';
import { UserDto } from '../user/dto/user.dto';
import {
  LoginResponseDto,
  RegisterResponseDto,
  LoginRequestDto,
} from './dto/auth-response.dto';

@ApiTags('authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({
    summary: 'User Login',
    description:
      'Authenticate user with email and password. Returns JWT access token.',
  })
  @ApiBody({
    type: LoginRequestDto,
    description: 'User login credentials',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Login successful, returns access token',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid email or password',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
  })
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Request() req: any): Promise<LoginResponseDto> {
    if (!req.user) {
      throw new BadRequestException('Invalid credentials');
    }
    return this.authService.login(req.user);
  }

  @ApiOperation({
    summary: 'User Registration',
    description: 'Register a new user account with email, username, and password.',
  })
  @ApiBody({
    type: UserDto,
    description: 'User registration details',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User registered successfully',
    type: RegisterResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'User already exists with this email',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid registration data',
  })
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() body: UserDto): Promise<RegisterResponseDto> {
    if (!body.email || !body.username || !body.password) {
      throw new BadRequestException(
        'Email, username, and password are required',
      );
    }
    return this.authService.register(body);
  }
}
