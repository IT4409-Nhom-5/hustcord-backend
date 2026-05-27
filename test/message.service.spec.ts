import { describe, it, beforeEach, afterEach } from 'mocha';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { MessageService } from '../src/modules/message/message.service';
import { Message } from '../src/modules/message/message.entity';
import { Channel } from '../src/modules/channel/channel.entity';

describe('MessageService', () => {
  let messageService: MessageService;
  let findByPkStub: sinon.SinonStub;
  let findAllStub: sinon.SinonStub;
  let createStub: sinon.SinonStub;
  let updateStub: sinon.SinonStub;
  let channelUpdateStub: sinon.SinonStub;

  beforeEach(() => {
    messageService = new MessageService();
    findByPkStub = sinon.stub(Message, 'findByPk');
    findAllStub = sinon.stub(Message, 'findAll');
    createStub = sinon.stub(Message, 'create');
    updateStub = sinon.stub(Message, 'update');
    channelUpdateStub = sinon.stub(Channel, 'update');
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('getMessage', () => {
    it('should return message if found', async () => {
      const mockMessage = {
        id: '1',
        text: 'Hello',
        channelId: 'ch1',
        userId: 'u1'
      };
      findByPkStub.resolves(mockMessage);

      const result = await messageService.getMessage({ id: '1' });

      expect(result).to.deep.equal(mockMessage);
      expect(findByPkStub.calledWith('1')).to.be.true;
    });

    it('should return error object if message not found', async () => {
      findByPkStub.rejects(new Error('Not found'));

      const result = await messageService.getMessage({ id: 'invalid' }) as any;

      expect(result.statusCode).to.equal('404');
      expect(result.message).to.include('not found');
    });
  });

  describe('getMessagesByChannel', () => {
    it('should return all messages in a channel ordered by creation', async () => {
      const mockMessages = [
        { id: '1', text: 'First', channelId: 'ch1', createdAt: new Date('2024-01-01') },
        { id: '2', text: 'Second', channelId: 'ch1', createdAt: new Date('2024-01-02') }
      ];
      findAllStub.resolves(mockMessages);

      const result = await messageService.getMessagesByChannel({ id: 'ch1' }) as any;

      expect(result).to.have.lengthOf(2);
      expect(result[0].text).to.equal('First');
      expect(findAllStub.called).to.be.true;
    });

    it('should return error if channel not found', async () => {
      findAllStub.rejects(new Error('Not found'));

      const result = await messageService.getMessagesByChannel({ id: 'invalid' }) as any;

      expect(result.statusCode).to.equal('404');
    });
  });

  describe('addMessage', () => {
    it('should create message and add to channel', async () => {
      const mockMessage = {
        id: '1',
        text: 'New message',
        channelId: 'ch1',
        userId: 'u1'
      };
      createStub.resolves(mockMessage);
      channelUpdateStub.resolves([1]);

      const result = await messageService.addMessage({
        text: 'New message',
        images: [],
        channelId: 'ch1',
        userId: 'u1'
      });

      expect(result.statusCode).to.equal('201');
      expect(result.message).to.include('successfully');
      expect(createStub.called).to.be.true;
      expect(channelUpdateStub.called).to.be.true;
    });

    it('should return error if creation fails', async () => {
      createStub.rejects(new Error('Database error'));

      const result = await messageService.addMessage({
        text: 'New message',
        images: [],
        channelId: 'ch1',
        userId: 'u1'
      });

      expect(result.statusCode).to.equal(400);
    });
  });

  describe('updateMessage', () => {
    it('should update message successfully', async () => {
      updateStub.resolves([1]);

      const result = await messageService.updateMessage({
        id: '1',
        message: { text: 'Updated text' }
      });

      expect(result.statusCode).to.equal('200');
      expect(updateStub.called).to.be.true;
    });
  });
});
