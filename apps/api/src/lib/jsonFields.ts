/**
 * Parse a JSON-encoded string array stored in SQLite text fields.
 */
export function parseStringArray(raw: string): string[] {
  try {
    const v = JSON.parse(raw) as unknown;
    if (!Array.isArray(v)) return [];
    return v.filter((x): x is string => typeof x === 'string');
  } catch {
    return [];
  }
}

/**
 * Serialize a string array for SQLite storage.
 */
export function stringifyStringArray(arr: string[]): string {
  return JSON.stringify(arr);
}
