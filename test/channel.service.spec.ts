import { describe, it, beforeEach, afterEach } from 'mocha';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { ChannelService } from '../src/modules/channel/channel.service';
import { Channel } from '../src/modules/channel/channel.entity';
import { User } from '../src/modules/user/user.entity';
import { Message } from '../src/modules/message/message.entity';

describe('ChannelService', () => {
  let channelService: ChannelService;
  let channelFindByPkStub: sinon.SinonStub;
  let channelFindAllStub: sinon.SinonStub;
  let userFindByPkStub: sinon.SinonStub;
  let messageFindOneStub: sinon.SinonStub;

  beforeEach(() => {
    channelService = new ChannelService();
    channelFindByPkStub = sinon.stub(Channel, 'findByPk');
    channelFindAllStub = sinon.stub(Channel, 'findAll');
    userFindByPkStub = sinon.stub(User, 'findByPk');
    messageFindOneStub = sinon.stub(Message, 'findOne');
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('getChannel', () => {
    it('should return channel with populated participants', async () => {
      const mockParticipants = [
        { id: 'u1', username: 'user1' },
        { id: 'u2', username: 'user2' }
      ];
      
      const mockChannel = {
        id: 'ch1',
        participants: ['u1', 'u2'],
        name: 'General'
      };
      
      channelFindByPkStub.resolves(mockChannel);
      userFindByPkStub.withArgs('u1').resolves(mockParticipants[0]);
      userFindByPkStub.withArgs('u2').resolves(mockParticipants[1]);

      const result = await channelService.getChannel('ch1') as any;

      expect(result.id).to.equal('ch1');
      expect(result.participants).to.have.lengthOf(2);
      expect(userFindByPkStub.callCount).to.equal(2);
    });

    it('should return error if channel not found', async () => {
      channelFindByPkStub.rejects(new Error('Not found'));

      const result = await channelService.getChannel('invalid') as any;

      expect(result.statusCode).to.equal('404');
      expect(result.message).to.include('not found');
    });
  });

  describe('getChannelsByUser', () => {
    it('should return channels with last messages for user', async () => {
      const mockChannels = [
        { id: 'ch1', name: 'General', updatedAt: new Date('2024-01-02') },
        { id: 'ch2', name: 'Random', updatedAt: new Date('2024-01-01') }
      ];
      
      const mockLastMessages = [
        { id: 'm1', text: 'Last msg in ch1', channelId: 'ch1' },
        { id: 'm2', text: 'Last msg in ch2', channelId: 'ch2' }
      ];

      channelFindAllStub.resolves(mockChannels);
      messageFindOneStub.withArgs({
        where: { channelId: 'ch1' },
        order: [['createdAt', 'DESC']]
      }).resolves(mockLastMessages[0]);
      messageFindOneStub.withArgs({
        where: { channelId: 'ch2' },
        order: [['createdAt', 'DESC']]
      }).resolves(mockLastMessages[1]);

      const result = await channelService.getChannelsByUser('u1') as any;

      expect(result.generalChannels).to.have.lengthOf(2);
      expect(result.lastMessages).to.have.lengthOf(2);
    });

    it('should return error if user not found', async () => {
      channelFindAllStub.rejects(new Error('Not found'));

      const result = await channelService.getChannelsByUser('invalid') as any;

      expect(result.statusCode).to.equal('404');
    });
  });
});
