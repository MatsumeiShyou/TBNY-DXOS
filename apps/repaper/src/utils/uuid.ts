export type UUID = string & { readonly __brand: 'UUID' };

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * ランタイムでUUID形式を検証するType Guard
 */
export function isUUID(str: string): str is UUID {
  return UUID_REGEX.test(str);
}

/**
 * 安全にUUID型へパースする。不正な場合はnullを返す。
 */
export function parseUUID(str: string | null | undefined): UUID | null {
  if (!str) return null;
  if (isUUID(str)) return str;
  return null;
}

/**
 * 厳格にUUID型を要求する。不正な場合は例外をスローする。
 */
export function assertUUID(str: string): UUID {
  if (isUUID(str)) return str;
  throw new Error(`Invalid UUID format: ${str}`);
}