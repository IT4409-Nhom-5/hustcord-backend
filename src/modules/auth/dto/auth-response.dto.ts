import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiProperty({
    example: '200',
    description: 'Status code',
  })
  statusCode: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT access token',
  })
  access_token: string;
}

export class RegisterResponseDto {
  @ApiProperty({
    example: '201',
    description: 'Status code',
  })
  statusCode: string;

  @ApiProperty({
    example: 'User created successfully.',
    description: 'Success message',
  })
  message: string;
}

export class LoginRequestDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email address',
  })
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'Password',
  })
  password: string;
}
