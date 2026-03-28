import { afterEach, describe, expect, it } from 'vitest';
import { createTestRuntime } from '../../helpers/testRuntime.js';

describe('GlobalVariableService', () => {
  afterEach(() => {
    // isolated DB per test
  });

  it('rejects global variable creation without alias', () => {
    const runtime = createTestRuntime();

    expect(() =>
      runtime.globalVariableService.upsert({
        alias: '   ',
        key: 'OPENAI_API_KEY',
        value: 'abc'
      })
    ).toThrow('alias is required for global variables');

    runtime.db.close();
  });

  it('accepts global variable with alias and persists decryptable payload', () => {
    const runtime = createTestRuntime();

    const stored = runtime.globalVariableService.upsert({
      alias: 'payments-provider',
      key: 'OPENAI_API_KEY',
      value: 'super-secret'
    });

    expect(stored.alias).toBe('payments-provider');
    expect(stored.key).toBe('OPENAI_API_KEY');

    const values = runtime.globalVariableRepo.list();
    expect(values).toHaveLength(1);
    expect(values[0].encrypted).toBe(false);
    expect(runtime.encryption.decryptForUse(values[0].value)).toBe('super-secret');

    runtime.db.close();
  });
});
