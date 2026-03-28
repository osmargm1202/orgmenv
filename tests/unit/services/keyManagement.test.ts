import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AGE_PRIVATE_KEY_PREFIX, resolveEffectiveKeyState } from '../../../src/services/keyManagement.js';

const ORIGINAL_AGE_KEY_FILE = process.env.AGE_KEY_FILE;
const ORIGINAL_XDG_CONFIG_HOME = process.env.XDG_CONFIG_HOME;

describe.sequential('resolveEffectiveKeyState', () => {
  let tempDir = '';

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'orgmenv-key-state-'));
    delete process.env.AGE_KEY_FILE;
    process.env.XDG_CONFIG_HOME = tempDir;
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });

    if (ORIGINAL_AGE_KEY_FILE === undefined) {
      delete process.env.AGE_KEY_FILE;
    } else {
      process.env.AGE_KEY_FILE = ORIGINAL_AGE_KEY_FILE;
    }

    if (ORIGINAL_XDG_CONFIG_HOME === undefined) {
      delete process.env.XDG_CONFIG_HOME;
    } else {
      process.env.XDG_CONFIG_HOME = ORIGINAL_XDG_CONFIG_HOME;
    }
  });

  it('returns configured when AGE_KEY_FILE points to an existing key file', () => {
    const envKeyPath = path.join(tempDir, 'env.agekey');
    fs.writeFileSync(envKeyPath, `${AGE_PRIVATE_KEY_PREFIX}1env`);
    process.env.AGE_KEY_FILE = envKeyPath;

    const state = resolveEffectiveKeyState('/tmp/ignored-fallback.txt');

    expect(state.source).toBe('env');
    expect(state.status).toBe('configured');
    expect(state.existingKeyPath).toBe(envKeyPath);
    expect(state.generationTargetPath).toBe(envKeyPath);
  });

  it('returns configured when AGE_KEY_FILE points to a directory containing a key', () => {
    const keyDir = path.join(tempDir, 'env-dir');
    const keyPath = path.join(keyDir, 'project.key');
    fs.mkdirSync(keyDir, { recursive: true });
    fs.writeFileSync(keyPath, `${AGE_PRIVATE_KEY_PREFIX}1dir`);
    process.env.AGE_KEY_FILE = keyDir;

    const state = resolveEffectiveKeyState();

    expect(state.source).toBe('env');
    expect(state.status).toBe('configured');
    expect(state.existingKeyPath).toBe(keyPath);
    expect(state.generationTargetPath).toBe(keyPath);
  });

  it('returns missing when configured key path is present but key file does not exist', () => {
    const missingPath = path.join(tempDir, 'missing/age.txt');

    const state = resolveEffectiveKeyState(missingPath);

    expect(state.source).toBe('config');
    expect(state.status).toBe('missing');
    expect(state.existingKeyPath).toBeUndefined();
    expect(state.generationTargetPath).toBe(missingPath);
  });

  it('returns unconfigured when no key source is defined', () => {
    const state = resolveEffectiveKeyState();

    expect(state.source).toBe('none');
    expect(state.status).toBe('unconfigured');
    expect(state.existingKeyPath).toBeUndefined();
    expect(state.generationTargetPath.endsWith('/orgmenv/keys/age.txt')).toBe(true);
  });
});
