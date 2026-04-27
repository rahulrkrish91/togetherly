import { describe, expect, it } from 'vitest';
import { resolveConflict } from './conflictResolution';

describe('resolveConflict', () => {
  it('prefers server record on newer timestamp', () => {
    const local = { id: '1', updatedAt: 10, value: 'local' };
    const server = { id: '1', updatedAt: 20, value: 'server' };

    expect(resolveConflict(local, server)).toEqual(server);
  });

  it('prefers local when local is newer', () => {
    const local = { id: '1', updatedAt: 30, value: 'local' };
    const server = { id: '1', updatedAt: 20, value: 'server' };

    expect(resolveConflict(local, server)).toEqual(local);
  });
});
