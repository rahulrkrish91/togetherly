import { trackError, trackEvent } from '../telemetry/telemetry';

export interface CallSession {
  id: string;
  familyId: string;
  initiatorId: string;
  mode: 'voice' | 'video';
}

/**
 * WebRTC signaling/service placeholder.
 * Intended to be backed by Firestore signaling docs + TURN config.
 */
export async function startCallSession(payload: {
  familyId: string;
  initiatorId: string;
  mode: 'voice' | 'video';
}): Promise<CallSession> {
  const session: CallSession = {
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    familyId: payload.familyId,
    initiatorId: payload.initiatorId,
    mode: payload.mode,
  };
  trackEvent('call_session_started', session);
  return session;
}

export async function endCallSession(sessionId: string) {
  trackEvent('call_session_ended', { sessionId });
}

export function onCallFailure(error: unknown, context?: Record<string, unknown>) {
  trackError('call_session_failed', error, context);
}
