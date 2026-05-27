import { describe, it, beforeEach, afterEach } from 'mocha';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { ConflictException } from '@nestjs/common';
import { AuthService } from '../src/modules/auth/auth.service';
import { UserService } from '../src/modules/user/user.service';
import { JwtService } from '@nestjs/jwt';

describe('AuthService', () => {
  let authService: AuthService;
  let userServiceMock: sinon.SinonStubbedInstance<UserService>;
  let jwtServiceMock: sinon.SinonStubbedInstance<JwtService>;

  beforeEach(() => {
    userServiceMock = sinon.stub(new UserService());
    jwtServiceMock = sinon.stub(new JwtService({}));
    authService = new AuthService(userServiceMock as any, jwtServiceMock as any);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('validateUser', () => {
    it('should return null if user not found', async () => {
      userServiceMock.findByEmail.resolves(null);

      const result = await authService.validateUser('test@test.com', 'password123');

      expect(result).to.be.null;
      expect(userServiceMock.findByEmail.calledWith('test@test.com')).to.be.true;
    });
  });

  describe('register', () => {
    it('should throw ConflictException if user already exists', async () => {
      userServiceMock.findByEmail.resolves({ id: '1' } as any);

      try {
        await authService.register({
          email: 'test@test.com',
          username: 'testuser',
          password: 'password123'
        });
        expect.fail('Should have thrown ConflictException');
      } catch (error) {
        expect(error).to.be.instanceof(ConflictException);
      }
    });

    it('should create user if email not found', async () => {
      userServiceMock.findByEmail.resolves(null);
      userServiceMock.createUser.resolves({ id: '1' });

      const result = await authService.register({
        email: 'new@test.com',
        username: 'newuser',
        password: 'password123'
      });

      expect(result.statusCode).to.equal('201');
      expect(result.message).to.include('successfully');
      expect(userServiceMock.createUser.called).to.be.true;
    });
  });

  describe('login', () => {
    it('should return access token and user data', async () => {
      jwtServiceMock.sign.returns('jwt_token_here');

      const user = {
        id: '1',
        username: 'testuser',
        email: 'test@test.com',
        role: 'user',
        image: 'avatar.jpg'
      };

      const result = await authService.login(user);

      expect(result.statusCode).to.equal('200');
      expect(result.access_token).to.equal('jwt_token_here');
      expect(result.user.id).to.equal('1');
      expect(result.user.email).to.equal('test@test.com');
    });
  });
});
