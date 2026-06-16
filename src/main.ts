import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // CORS configuration - allow dev origins + any configured production origins
  const defaultOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5174',
    'https://hustcord.web.app',
    'https://hustcord.firebaseapp.com',
  ];
  const envOrigins = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((o) => o.trim().replace(/\/$/, '')) // bỏ dấu "/" cuối nếu có
    .filter(Boolean);
  const allowedOrigins = Array.from(new Set([...defaultOrigins, ...envOrigins]));

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Phục vụ file đã upload (disk storage) qua đường dẫn /uploads
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads/' });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('HustCord API')
    .setDescription('HustCord Backend API Documentation')
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'JWT access token',
    })
    .addServer('http://localhost:3000', 'Local server')
    .build();

  if (process.env.HUSTCORD_BACKEND_URL) {
    config.servers = [
      { url: process.env.HUSTCORD_BACKEND_URL, description: 'Deployed server' },
      ...(config.servers || []),
    ];
  }

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0');
  const publicUrl = process.env.HUSTCORD_BACKEND_URL || `http://localhost:${port}`;
  console.log(`Application is running on: ${publicUrl}`);
  console.log(`Swagger documentation: ${publicUrl}/api`);
}
bootstrap();