import { parseSearch, buildSearch, isEqual } from './urlUtils';

describe('parseSearch', () => {
  test('parses empty string', () => {
    const result = parseSearch('');
    expect(result.size).toBe(0);
  });

  test('parses query string with question mark', () => {
    const result = parseSearch('?foo=bar&baz=qux');
    expect(result.get('foo')).toBe('bar');
    expect(result.get('baz')).toBe('qux');
  });

  test('parses query string without question mark', () => {
    const result = parseSearch('foo=bar&baz=qux');
    expect(result.get('foo')).toBe('bar');
    expect(result.get('baz')).toBe('qux');
  });

  test('handles empty values', () => {
    const result = parseSearch('?foo=&bar=value');
    expect(result.get('foo')).toBe('');
    expect(result.get('bar')).toBe('value');
  });

  test('handles keys without values', () => {
    const result = parseSearch('?foo&bar=value');
    expect(result.get('foo')).toBe('');
    expect(result.get('bar')).toBe('value');
  });

  test('handles malformed pairs', () => {
    const result = parseSearch('?=value&key=');
    expect(result.size).toBe(1);
    expect(result.get('key')).toBe('');
  });

  test('handles duplicate keys (last one wins)', () => {
    const result = parseSearch('?foo=first&foo=second');
    expect(result.get('foo')).toBe('second');
  });
});

describe('buildSearch', () => {
  test('returns empty string for empty map', () => {
    const result = buildSearch(new Map());
    expect(result).toBe('');
  });

  test('builds single parameter', () => {
    const params = new Map([['foo', 'bar']]);
    const result = buildSearch(params);
    expect(result).toBe('?foo=bar');
  });

  test('builds multiple parameters', () => {
    const params = new Map([
      ['foo', 'bar'],
      ['baz', 'qux']
    ]);
    const result = buildSearch(params);
    expect(result).toBe('?foo=bar&baz=qux');
  });

  test('preserves empty values', () => {
    const params = new Map([
      ['foo', ''],
      ['bar', 'value']
    ]);
    const result = buildSearch(params);
    expect(result).toBe('?foo=&bar=value');
  });

  test('preserves parameter order', () => {
    const params = new Map();
    params.set('z', '3');
    params.set('a', '1');
    params.set('m', '2');
    const result = buildSearch(params);
    expect(result).toBe('?z=3&a=1&m=2');
  });
});

describe('isEqual', () => {
  test('primitives', () => {
    expect(isEqual(1, 1)).toBe(true);
    expect(isEqual(1, 2)).toBe(false);
    expect(isEqual('a', 'a')).toBe(true);
    expect(isEqual('a', 'b')).toBe(false);
    expect(isEqual(true, true)).toBe(true);
    expect(isEqual(true, false)).toBe(false);
    expect(isEqual(null, null)).toBe(true);
    expect(isEqual(undefined, undefined)).toBe(true);
  });

  test('different types', () => {
    expect(isEqual(1, '1')).toBe(false);
    expect(isEqual(true, 1)).toBe(false);
    expect(isEqual({}, [])).toBe(false);
    expect(isEqual(null, undefined)).toBe(false);
  });

  test('objects', () => {
    expect(isEqual({}, {})).toBe(true);
    expect(isEqual({ a: 1 }, { a: 1 })).toBe(true);
    expect(isEqual({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true);
    expect(isEqual({ a: 1 }, { a: 2 })).toBe(false);
    expect(isEqual({ a: 1 }, { b: 1 })).toBe(false);
    expect(isEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false);
  });

  test('nested objects', () => {
    expect(isEqual(
      { a: { b: { c: 1 } } },
      { a: { b: { c: 1 } } }
    )).toBe(true);
    expect(isEqual(
      { a: { b: { c: 1 } } },
      { a: { b: { c: 2 } } }
    )).toBe(false);
  });

  test('arrays', () => {
    expect(isEqual([], [])).toBe(true);
    expect(isEqual([1, 2, 3], [1, 2, 3])).toBe(true);
    expect(isEqual([1, 2], [1, 2, 3])).toBe(false);
    expect(isEqual([1, 2], [2, 1])).toBe(false);
  });

  test('arrays with objects', () => {
    expect(isEqual(
      [{ a: 1 }, { b: 2 }],
      [{ a: 1 }, { b: 2 }]
    )).toBe(true);
    expect(isEqual(
      [{ a: 1 }, { b: 2 }],
      [{ a: 1 }, { b: 3 }]
    )).toBe(false);
  });

  test('special cases', () => {
    expect(isEqual(0, -0)).toBe(true);
    expect(isEqual(NaN, NaN)).toBe(true);
  });
}); 