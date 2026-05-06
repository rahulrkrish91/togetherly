import { describe, expect, it } from 'vitest';
import { changedFields } from './safeWrite';

describe('changedFields', () => {
  it('returns only changed keys', () => {
    const current = { a: 1, b: 2, c: 3 };
    const next = { a: 1, b: 4 };

    expect(changedFields(current, next)).toEqual({ b: 4 });
  });

  it('returns full patch when current is undefined', () => {
    expect(changedFields(undefined, { name: 'A' })).toEqual({ name: 'A' });
  });
});
