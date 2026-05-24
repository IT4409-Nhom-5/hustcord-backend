import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Admin Module (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let userToken: string;
  let userId: string;

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

    // Create admin user and get token
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'admin@example.com',
        username: 'adminuser',
        password: 'adminpass123',
      });

    const adminRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'adminpass123',
      });
    adminToken = adminRes.body.access_token;

    // Create regular user and get token
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'user@example.com',
        username: 'regularuser',
        password: 'userpass123',
      });

    const userRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'user@example.com',
        password: 'userpass123',
      });
    userToken = userRes.body.access_token;

    // Parse userId from token
    const payload = JSON.parse(
      Buffer.from(userRes.body.access_token.split('.')[1], 'base64').toString(),
    );
    userId = payload.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Admin Guard Protection', () => {
    it('should deny access to admin endpoint for non-admin user', () => {
      return request(app.getHttpServer())
        .get('/admin/dashboard')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403)
        .expect((res) => {
          expect(res.body.message).toContain('Admins only');
        });
    });

    it('should deny access to admin endpoint without JWT', () => {
      return request(app.getHttpServer())
        .get('/admin/dashboard')
        .expect(401);
    });

    it('should allow admin to access dashboard', () => {
      return request(app.getHttpServer())
        .get('/admin/dashboard')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.users).toBeDefined();
          expect(res.body.channels).toBeDefined();
          expect(res.body.messages).toBeDefined();
        });
    });
  });

  describe('Admin User Management', () => {
    it('should allow admin to get all users', () => {
      return request(app.getHttpServer())
        .get('/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.count).toBeDefined();
          expect(res.body.rows).toBeDefined();
          expect(Array.isArray(res.body.rows)).toBe(true);
          // Verify no passwords in response
          res.body.rows.forEach((user: any) => {
            expect(user.password).toBeUndefined();
          });
        });
    });

    it('should deny non-admin from getting all users', () => {
      return request(app.getHttpServer())
        .get('/admin/users')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('should allow admin to change user role', () => {
      return request(app.getHttpServer())
        .patch(`/admin/users/${userId}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'admin' })
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toContain('successfully');
        });
    });

    it('should deny non-admin from changing user role', () => {
      return request(app.getHttpServer())
        .patch(`/admin/users/${userId}/role`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ role: 'admin' })
        .expect(403);
    });
  });

  describe('Admin Channel Management', () => {
    it('should allow admin to view all channels', () => {
      return request(app.getHttpServer())
        .get('/admin/channels')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should deny non-admin from viewing all channels', () => {
      return request(app.getHttpServer())
        .get('/admin/channels')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });
  });

  describe('Admin Message Management', () => {
    it('should deny non-admin from deleting messages', () => {
      return request(app.getHttpServer())
        .delete('/admin/messages/some-message-id')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('should allow admin to delete messages (with valid message ID)', () => {
      // This will likely return 200 even if message doesn't exist
      // since admin has permission
      return request(app.getHttpServer())
        .delete('/admin/messages/nonexistent-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });
  });
});
