import {
  Body,
  Controller,
  Post,
  UseGuards,
  Get,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LocalAuthGuard } from '../../common/guards/local-auth.guard';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiBody({
    schema: {
      properties: {
        email: { type: 'string' },
        displayName: { type: 'string' },
        password: { type: 'string' },
        phoneNumber: { type: 'string' },
      },
      required: ['email', 'displayName', 'password'],
    },
  })
  async register(
    @Body()
    body: {
      email: string;
      displayName: string;
      password: string;
      phoneNumber?: string;
    },
  ) {
    const result = await this.authService.register(
      body.email,
      body.displayName,
      body.password,
    );

    return {
      access_token: result.access_token,
      refresh_token: result.refresh_token,
      user: {
        id: result.user.id,
        email: result.user.email,
        displayName: result.user.name,
        phoneNumber: body.phoneNumber || '',
      },
    };
  }

  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, description: 'User logged in successfully' })
  @ApiBody({
    schema: {
      properties: {
        email: { type: 'string' },
        password: { type: 'string' },
      },
    },
  })
  @UseGuards(LocalAuthGuard)
  async login(@Req() req: any) {
    if (!req.user) {
      throw new UnauthorizedException('User not found');
    }

    return this.authService.login(req.user);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh JWT token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @UseGuards(AuthGuard('jwt-refresh'))
  async refresh(@Req() req: any) {
    const user = req.user;
    return this.authService.refreshToken(user);
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 200, description: 'User profile fetched successfully' })
  @ApiResponse({ status: 401, description: 'Invalid or expired token' })
  @UseGuards(AuthGuard('jwt'))
  async getProfile(@Req() req: any) {
    const user = req.user;
    return this.authService.getProfileById(user.sub || user._id);
  }
}