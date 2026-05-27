import { describe, it, beforeEach, afterEach } from 'mocha';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { UserService } from '../src/modules/user/user.service';
import { User } from '../src/modules/user/user.entity';

describe('UserService', () => {
  let userService: UserService;
  let findOneStub: sinon.SinonStub;
  let findByPkStub: sinon.SinonStub;
  let findAllStub: sinon.SinonStub;
  let createStub: sinon.SinonStub;
  let updateStub: sinon.SinonStub;

  beforeEach(() => {
    userService = new UserService();
    findOneStub = sinon.stub(User, 'findOne');
    findByPkStub = sinon.stub(User, 'findByPk');
    findAllStub = sinon.stub(User, 'findAll');
    createStub = sinon.stub(User, 'create');
    updateStub = sinon.stub(User, 'update');
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('findByEmail', () => {
    it('should return user if found by email', async () => {
      const mockUser = { id: '1', email: 'test@test.com', username: 'testuser' };
      findOneStub.resolves(mockUser);

      const result = await userService.findByEmail('test@test.com');

      expect(result).to.deep.equal(mockUser);
      expect(findOneStub.calledWith({ where: { email: 'test@test.com' } })).to.be.true;
    });

    it('should return undefined if user not found', async () => {
      findOneStub.resolves(null);

      const result = await userService.findByEmail('notfound@test.com');

      expect(result).to.be.null;
    });
  });

  describe('findById', () => {
    it('should return user if found by id', async () => {
      const mockUser = { id: '1', email: 'test@test.com', username: 'testuser' };
      findByPkStub.resolves(mockUser);

      const result = await userService.findById('1');

      expect(result).to.deep.equal(mockUser);
      expect(findByPkStub.called).to.be.true;
    });

    it('should exclude password field', async () => {
      findByPkStub.resolves({ id: '1', email: 'test@test.com' });

      await userService.findById('1');

      const call = findByPkStub.getCall(0);
      expect(call.args[1].attributes.exclude).to.include('password');
    });
  });

  describe('createUser', () => {
    it('should create user with email, username, and password', async () => {
      const mockUser = { id: '1', email: 'test@test.com', username: 'testuser', password: 'hashed' };
      createStub.resolves(mockUser);

      const result = await userService.createUser({
        email: 'test@test.com',
        username: 'testuser',
        password: 'hashed_password'
      });

      expect(result.id).to.equal('1');
      expect(result.email).to.equal('test@test.com');
      expect(createStub.called).to.be.true;
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      updateStub.resolves([1]);

      const result = await userService.updateUser({
        id: '1',
        username: 'newusername'
      });

      expect(result[0]).to.equal(1);
      expect(updateStub.called).to.be.true;
    });

    it('should return error message if username already in use', async () => {
      updateStub.rejects(new Error('Unique constraint failed'));

      const result = await userService.updateUser({
        id: '1',
        username: 'taken'
      }) as any;

      expect(result.statusCode).to.equal('404');
      expect(result.message).to.include('already in use');
    });
  });

  describe('findBySearch', () => {
    it('should find users matching search query', async () => {
      const mockUsers = [
        { id: '1', username: 'testuser' },
        { id: '2', username: 'testuser2' }
      ];
      findAllStub.resolves(mockUsers);

      const result = await userService.findBySearch('test');

      expect(result).to.have.lengthOf(2);
      expect(findAllStub.called).to.be.true;
    });
  });
});
