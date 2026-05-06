import { describe, expect, it } from 'vitest';
import { isValidFamilyMemberRecord, isValidUserRecord } from './validators';

describe('validators', () => {
  it('validates user records', () => {
    expect(isValidUserRecord({ displayName: 'Sam' })).toBe(true);
    expect(isValidUserRecord({})).toBe(false);
  });

  it('validates family member records', () => {
    expect(
      isValidFamilyMemberRecord({ familyId: 'f1', userId: 'u1', role: 'admin' })
    ).toBe(true);
    expect(
      isValidFamilyMemberRecord({ familyId: 'f1', userId: 'u1', role: 'owner' })
    ).toBe(false);
  });
});
