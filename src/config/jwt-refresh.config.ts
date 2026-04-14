import { registerAs } from '@nestjs/config';

export default registerAs('jwtRefresh', () => ({
  secret: process.env.JWT_REFRESH_SECRET || 'superrefreshsecret',
  expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
}));