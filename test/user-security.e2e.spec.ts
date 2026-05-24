import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('User & Security (e2e)', () => {
  let app: INestApplication;
  let user1Token: string;
  let user2Token: string;
  let user1Id: string;
  let user2Id: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    // Create user 1
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'user1@example.com',
        username: 'user1',
        password: 'password123',
      });

    const user1Res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'user1@example.com',
        password: 'password123',
      });
    user1Token = user1Res.body.access_token;
    const payload1 = JSON.parse(
      Buffer.from(user1Res.body.access_token.split('.')[1], 'base64').toString(),
    );
    user1Id = payload1.id;

    // Create user 2
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'user2@example.com',
        username: 'user2',
        password: 'password123',
      });

    const user2Res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'user2@example.com',
        password: 'password123',
      });
    user2Token = user2Res.body.access_token;
    const payload2 = JSON.parse(
      Buffer.from(user2Res.body.access_token.split('.')[1], 'base64').toString(),
    );
    user2Id = payload2.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('User Ownership Protection', () => {
    it('should allow user to update own profile', () => {
      return request(app.getHttpServer())
        .put(`/users/${user1Id}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          email: 'user1@example.com',
          username: 'user1_updated',
          password: 'newpassword123',
        })
        .expect(200);
    });

    it('should prevent user from updating other user profile', () => {
      return request(app.getHttpServer())
        .put(`/users/${user2Id}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          email: 'hacked@example.com',
          username: 'hacked_user',
          password: 'hacked123',
        })
        .expect(403)
        .expect((res) => {
          expect(res.body.message).toContain('Cannot update other user profile');
        });
    });

    it('should prevent update without JWT token', () => {
      return request(app.getHttpServer())
        .put(`/users/${user1Id}`)
        .send({
          email: 'test@example.com',
          username: 'testuser',
          password: 'password123',
        })
        .expect(401);
    });
  });

  describe('Message Authorization', () => {
    let channelId: string;

    beforeAll(async () => {
      // Create a test channel
      const channelRes = await request(app.getHttpServer())
        .post('/channels')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          participants: [user1Id, user2Id],
          admins: [user1Id],
          image: 'https://example.com/image.jpg',
          name: 'Test Channel',
          description: 'Test channel for security',
        });
      channelId = channelRes.body.channel.id;
    });

    it('should require JWT to create message', () => {
      return request(app.getHttpServer())
        .post('/messages')
        .send({
          channelId,
          userId: user1Id,
          text: 'Hello',
          images: [],
        })
        .expect(401);
    });

    it('should allow authenticated user to create message', () => {
      return request(app.getHttpServer())
        .post('/messages')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          channelId,
          userId: user1Id,
          text: 'Hello from user1',
          images: [],
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.message).toContain('successfully');
        });
    });

    it('should prevent user from posting as another user', () => {
      return request(app.getHttpServer())
        .post('/messages')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          channelId,
          userId: user2Id, // Trying to post as user2
          text: 'Hacked message',
          images: [],
        })
        .expect(403)
        .expect((res) => {
          expect(res.body.message).toContain('Cannot post message as other user');
        });
    });

    it('should validate message DTO structure', () => {
      return request(app.getHttpServer())
        .post('/messages')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          channelId: 'invalid-uuid',
          userId: user1Id,
          text: 'Test',
          images: [],
        })
        .expect(400);
    });
  });

  describe('Channel Management', () => {
    it('should allow authenticated user to create channel', () => {
      return request(app.getHttpServer())
        .post('/channels')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          participants: [user1Id, user2Id],
          admins: [user1Id],
          image: 'https://example.com/image.jpg',
          name: 'New Channel',
          description: 'A new test channel',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.channel).toBeDefined();
          expect(res.body.channel.name).toBe('New Channel');
        });
    });

    it('should validate channel DTO', () => {
      return request(app.getHttpServer())
        .post('/channels')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          participants: [user1Id],
          // Missing required fields
        })
        .expect(400);
    });

    it('should prevent channel creation without JWT', () => {
      return request(app.getHttpServer())
        .post('/channels')
        .send({
          participants: [user1Id, user2Id],
          admins: [user1Id],
          image: 'https://example.com/image.jpg',
          name: 'Unauthorized Channel',
          description: 'Should fail',
        })
        .expect(401);
    });
  });

  describe('JWT Payload Verification', () => {
    it('should include role in JWT payload', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'user1@example.com',
          password: 'password123',
        })
        .expect(200)
        .expect((res) => {
          const token = res.body.access_token;
          const payload = JSON.parse(
            Buffer.from(token.split('.')[1], 'base64').toString(),
          );
          expect(payload.role).toBeDefined();
          expect(payload.id).toBeDefined();
          expect(payload.email).toBeDefined();
          expect(payload.username).toBeDefined();
        });
    });

    it('should include user email in JWT response', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'user1@example.com',
          password: 'password123',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.user.email).toBe('user1@example.com');
          expect(res.body.user.role).toBeDefined();
        });
    });
  });
});
