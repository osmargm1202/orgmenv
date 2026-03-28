import { afterEach, describe, expect, it, vi } from 'vitest';

const spawnSyncMock = vi.fn();
const existsSyncMock = vi.fn();

vi.mock('node:child_process', () => ({
  spawnSync: (...args: unknown[]) => spawnSyncMock(...args)
}));

vi.mock('node:fs', () => ({
  default: {
    existsSync: (...args: unknown[]) => existsSyncMock(...args)
  },
  existsSync: (...args: unknown[]) => existsSyncMock(...args)
}));

import { EncryptionService } from '../../../src/services/encryption.js';

const ORIGINAL_AGE_KEY_FILE = process.env.AGE_KEY_FILE;

afterEach(() => {
  spawnSyncMock.mockReset();
  existsSyncMock.mockReset();

  if (ORIGINAL_AGE_KEY_FILE === undefined) {
    delete process.env.AGE_KEY_FILE;
  } else {
    process.env.AGE_KEY_FILE = ORIGINAL_AGE_KEY_FILE;
  }
});

describe('EncryptionService', () => {
  it('resolves key source with AGE_KEY_FILE precedence over config path', () => {
    process.env.AGE_KEY_FILE = '/tmp/env-key.txt';
    const service = new EncryptionService({
      dbPath: ':memory:',
      useEncryption: true,
      keyPath: '/tmp/config-key.txt'
    });

    expect(service.resolveKeySource()).toEqual({ source: 'env', path: '/tmp/env-key.txt' });
  });

  it('uses config fallback when AGE_KEY_FILE is absent', () => {
    delete process.env.AGE_KEY_FILE;
    const service = new EncryptionService({
      dbPath: ':memory:',
      useEncryption: true,
      keyPath: '/tmp/config-key.txt'
    });

    expect(service.resolveKeySource()).toEqual({ source: 'config', path: '/tmp/config-key.txt' });
  });

  it('returns warning and stores plaintext when encryption is disabled', () => {
    const service = new EncryptionService({
      dbPath: ':memory:',
      useEncryption: false
    });

    const result = service.encryptForStorage('super-secret');

    expect(result.encrypted).toBe(false);
    expect(result.value).toBe('super-secret');
    expect(result.warning).toContain('Encryption disabled');
    expect(service.decryptForUse(result.value)).toBe('super-secret');
  });

  it('encrypts with age and decrypts using configured key', () => {
    process.env.AGE_KEY_FILE = '/tmp/env-key.txt';
    existsSyncMock.mockReturnValue(true);
    spawnSyncMock.mockImplementation((command: string, args?: string[]) => {
      const joined = [command, ...(args ?? [])].join(' ');
      if (joined === 'which age' || joined === 'which age-keygen') {
        return { status: 0 };
      }

      if (joined === 'age-keygen -y /tmp/env-key.txt') {
        return { status: 0, stdout: Buffer.from('age1recipient\n') };
      }

      if (joined === 'age --encrypt --recipient age1recipient') {
        return { status: 0, stdout: Buffer.from('cipher-binary') };
      }

      if (joined === 'age --decrypt --identity /tmp/env-key.txt') {
        return { status: 0, stdout: Buffer.from('super-secret') };
      }

      return { status: 1, stderr: Buffer.from(`unexpected command: ${joined}`) };
    });

    const service = new EncryptionService({
      dbPath: ':memory:',
      useEncryption: true,
      keyPath: '/tmp/config-key.txt'
    });

    const encrypted = service.encryptForStorage('super-secret');

    expect(encrypted.encrypted).toBe(true);
    expect(encrypted.value.startsWith('age::')).toBe(true);
    expect(encrypted.value).not.toContain('super-secret');
    expect(service.decryptForUse(encrypted.value)).toBe('super-secret');
  });

  it('fails fast when encryption tooling is missing', () => {
    process.env.AGE_KEY_FILE = '/tmp/env-key.txt';
    spawnSyncMock.mockImplementation((command: string, args?: string[]) => {
      const joined = [command, ...(args ?? [])].join(' ');
      if (joined === 'which age') {
        return { status: 0 };
      }

      if (joined === 'which age-keygen') {
        return { status: 1 };
      }

      return { status: 1, stderr: Buffer.from('should not execute') };
    });

    const service = new EncryptionService({
      dbPath: ':memory:',
      useEncryption: true
    });

    expect(() => service.encryptForStorage('super-secret')).toThrow(
      /missing required encryption tooling: age-keygen/
    );
  });

  it('fails fast when key source is missing while encryption is enabled', () => {
    delete process.env.AGE_KEY_FILE;
    spawnSyncMock.mockImplementation((command: string, args?: string[]) => {
      const joined = [command, ...(args ?? [])].join(' ');
      if (joined === 'which age' || joined === 'which age-keygen') {
        return { status: 0 };
      }

      return { status: 1, stderr: Buffer.from('should not execute') };
    });

    const service = new EncryptionService({
      dbPath: ':memory:',
      useEncryption: true
    });

    expect(() => service.encryptForStorage('super-secret')).toThrow(
      /encryption is enabled but no key source is configured/
    );
  });

  it('fails to decrypt age payload when key path does not exist', () => {
    process.env.AGE_KEY_FILE = '/tmp/missing-key.txt';
    existsSyncMock.mockReturnValue(false);
    spawnSyncMock.mockImplementation((command: string, args?: string[]) => {
      const joined = [command, ...(args ?? [])].join(' ');
      if (joined === 'which age' || joined === 'which age-keygen') {
        return { status: 0 };
      }

      return { status: 1, stderr: Buffer.from('should not execute') };
    });

    const service = new EncryptionService({
      dbPath: ':memory:',
      useEncryption: true
    });

    expect(() => service.decryptForUse('age::Y2lwaGVy')).toThrow(/key file not found/);
  });
});
