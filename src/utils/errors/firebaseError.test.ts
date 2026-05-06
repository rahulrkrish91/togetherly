import { describe, expect, it } from 'vitest';
import { parseFirebaseError } from './firebaseError';

describe('parseFirebaseError', () => {
  it('returns retryable for network-like errors', () => {
    const parsed = parseFirebaseError({ code: 'auth/network-request-failed', message: 'network issue' });
    expect(parsed.retryable).toBe(true);
    expect(parsed.code).toBe('auth/network-request-failed');
  });

  it('falls back to unknown defaults', () => {
    const parsed = parseFirebaseError(null);
    expect(parsed.code).toBe('unknown/error');
    expect(parsed.message).toBe('Something went wrong.');
  });
});
