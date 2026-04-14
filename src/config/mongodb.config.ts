import { registerAs } from '@nestjs/config';

export default registerAs('mongodb', () => ({
  uri: process.env.MONGO_URI || 'mongodb://localhost:27017/hustcord',
}));
