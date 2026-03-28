import { describe, expect, it } from 'vitest';
import { escapeEnvValue, renderEnvLines, renderShellExports } from '../../../src/utils/envFormat.js';

describe('envFormat utilities', () => {
  it('keeps deterministic ordering with sortOrder and key fallback', () => {
    const rendered = renderEnvLines([
      { key: 'BETA', value: '2', sortOrder: 10 },
      { key: 'ALPHA', value: '1', sortOrder: 10 },
      { key: 'ZETA', value: '3', sortOrder: 12 },
      { key: 'NO_SORT', value: '4' }
    ]);

    expect(rendered).toEqual(['ALPHA=1', 'BETA=2', 'ZETA=3', 'NO_SORT=4']);
  });

  it('renders empty values and quotes/escapes complex values', () => {
    expect(renderEnvLines([{ key: 'EMPTY', value: '' }])).toEqual(['EMPTY=']);
    expect(escapeEnvValue('value with spaces')).toBe('"value with spaces"');
    expect(escapeEnvValue('line\nwrap')).toBe('"line\\nwrap"');
  });

  it('renders shell-aware export syntax for bash and fish', () => {
    const entries = [{ key: 'TOKEN', value: 'abc-123', sortOrder: 1 }];

    expect(renderShellExports(entries, 'bash')).toBe('export TOKEN="abc-123"');
    expect(renderShellExports(entries, 'fish')).toBe('set -gx TOKEN "abc-123";');
  });
});
