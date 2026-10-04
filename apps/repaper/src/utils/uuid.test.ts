import { describe, it, expect } from 'vitest';
import { isUUID, parseUUID, assertUUID } from './uuid';

describe('UUID Validation Utilities', () => {
  const validUUID = '123e4567-e89b-12d3-a456-426614174000';
  const invalidUUID = 'd1'; // UI列IDなど
  
  describe('isUUID', () => {
    it('正しいUUIDをtrueと判定すること', () => {
      expect(isUUID(validUUID)).toBe(true);
    });
    it('不正な文字列をfalseと判定すること', () => {
      expect(isUUID(invalidUUID)).toBe(false);
      expect(isUUID('123e4567-e89b-12d3-a456-42661417400')).toBe(false); // 文字足らず
    });
  });

  describe('parseUUID', () => {
    it('正しいUUIDはそのままUUID型として返すこと', () => {
      expect(parseUUID(validUUID)).toBe(validUUID);
    });
    it('不正な文字列や空値はnullを返すこと', () => {
      expect(parseUUID(invalidUUID)).toBeNull();
      expect(parseUUID('')).toBeNull();
      expect(parseUUID(null)).toBeNull();
      expect(parseUUID(undefined)).toBeNull();
    });
  });

  describe('assertUUID', () => {
    it('正しいUUIDはそのまま返すこと', () => {
      expect(assertUUID(validUUID)).toBe(validUUID);
    });
    it('不正な文字列はErrorをスローすること', () => {
      expect(() => assertUUID(invalidUUID)).toThrow('Invalid UUID format: d1');
    });
  });
});