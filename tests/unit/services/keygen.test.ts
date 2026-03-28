import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const spawnSyncMock = vi.fn();

vi.mock('node:child_process', () => ({
  spawnSync: (...args: unknown[]) => spawnSyncMock(...args)
}));

import { AGE_PRIVATE_KEY_PREFIX } from '../../../src/services/keyManagement.js';
import { generateAgeKeyFile } from '../../../src/services/keygen.js';

describe('generateAgeKeyFile', () => {
  let tempDir = '';

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'orgmenv-keygen-'));
    spawnSyncMock.mockReset();
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('returns resolved path and hardens permissions on success', () => {
    spawnSyncMock.mockImplementation((command: string, args: string[]) => {
      expect(command).toBe('age-keygen');
      expect(args[0]).toBe('-o');
      fs.writeFileSync(args[1], `${AGE_PRIVATE_KEY_PREFIX}1test`, { mode: 0o600 });
      return { status: 0, stderr: '' };
    });

    const out = generateAgeKeyFile(path.join(tempDir, 'tmp/dev/age.txt'));

    expect(out.path.endsWith('/tmp/dev/age.txt')).toBe(true);
    expect(out.created).toBe(true);
    expect(out.reused).toBe(false);
    expect(spawnSyncMock).toHaveBeenCalledTimes(1);
    expect(fs.existsSync(out.path)).toBe(true);
    expect(fs.statSync(out.path).mode & 0o777).toBe(0o600);
  });

  it('cleans partial key file when generation fails', () => {
    const output = path.join(tempDir, 'secure/age.txt');
    spawnSyncMock.mockImplementation((_command: string, args: string[]) => {
      fs.mkdirSync(path.dirname(args[1]), { recursive: true });
      fs.writeFileSync(args[1], 'partial-data');
      return { status: 1, stderr: 'permission denied' };
    });

    expect(() => generateAgeKeyFile(output)).toThrow(/failed to generate age key: permission denied/);
    expect(fs.existsSync(output)).toBe(false);
  });

  it('reuses existing key file without generating a duplicate', () => {
    const output = path.join(tempDir, 'existing/age.txt');
    fs.mkdirSync(path.dirname(output), { recursive: true });
    fs.writeFileSync(output, `${AGE_PRIVATE_KEY_PREFIX}1existing`);

    const out = generateAgeKeyFile(output);

    expect(out).toEqual({
      path: output,
      created: false,
      reused: true
    });
    expect(spawnSyncMock).not.toHaveBeenCalled();
  });

  it('reuses key discovered inside selected directory', () => {
    const keyDir = path.join(tempDir, 'keys');
    const existingKey = path.join(keyDir, 'team.agekey');
    fs.mkdirSync(keyDir, { recursive: true });
    fs.writeFileSync(existingKey, `${AGE_PRIVATE_KEY_PREFIX}1directory`);

    const out = generateAgeKeyFile(keyDir);

    expect(out).toEqual({
      path: existingKey,
      created: false,
      reused: true
    });
    expect(spawnSyncMock).not.toHaveBeenCalled();
  });
});
