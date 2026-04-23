import { Injectable } from '@nestjs/common';

interface VideoSession {
  callId: string;
  channelId: string;
  callerId: string;
  status: 'pending' | 'active' | 'ended';
  participants: string[];
  createdAt: string;
  offer?: any;
  answer?: any;
}

@Injectable()
export class VideoService {
  private videoSessions: Map<string, VideoSession> = new Map();

  generateCallId(): string {
    return `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  createVideoCall(
    channelId: string,
    callerId: string,
    invitedUsers?: string[],
  ): VideoSession {
    const callId = this.generateCallId();
    const session: VideoSession = {
      callId,
      channelId,
      callerId,
      status: 'pending',
      participants: [callerId, ...(invitedUsers || [])],
      createdAt: new Date().toISOString(),
    };
    this.videoSessions.set(callId, session);
    return session;
  }

  getVideoCall(callId: string): VideoSession | null {
    return this.videoSessions.get(callId) || null;
  }

  activateVideoCall(callId: string): VideoSession | null {
    const session = this.videoSessions.get(callId);
    if (session) {
      session.status = 'active';
      return session;
    }
    return null;
  }

  addParticipant(callId: string, userId: string): VideoSession | null {
    const session = this.videoSessions.get(callId);
    if (session && !session.participants.includes(userId)) {
      session.participants.push(userId);
      return session;
    }
    return session || null;
  }

  removeParticipant(callId: string, userId: string): VideoSession | null {
    const session = this.videoSessions.get(callId);
    if (session) {
      session.participants = session.participants.filter(p => p !== userId);
      if (session.participants.length === 0) {
        this.endVideoCall(callId);
      }
      return session;
    }
    return null;
  }

  endVideoCall(callId: string): VideoSession | null {
    const session = this.videoSessions.get(callId);
    if (session) {
      session.status = 'ended';
      // Keep session for 5 minutes for history, then delete
      setTimeout(() => {
        this.videoSessions.delete(callId);
      }, 5 * 60 * 1000);
      return session;
    }
    return null;
  }

  getActiveCallsForChannel(channelId: string): VideoSession[] {
    return Array.from(this.videoSessions.values()).filter(
      session =>
        session.channelId === channelId &&
        session.status === 'active',
    );
  }

  storeOffer(callId: string, offer: any): boolean {
    const session = this.videoSessions.get(callId);
    if (session) {
      session.offer = offer;
      return true;
    }
    return false;
  }

  storeAnswer(callId: string, answer: any): boolean {
    const session = this.videoSessions.get(callId);
    if (session) {
      session.answer = answer;
      return true;
    }
    return false;
  }

  getOffer(callId: string): any {
    const session = this.videoSessions.get(callId);
    return session?.offer || null;
  }

  getAnswer(callId: string): any {
    const session = this.videoSessions.get(callId);
    return session?.answer || null;
  }
}
