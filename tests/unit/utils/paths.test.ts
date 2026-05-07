import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { ensureOrgmenvDirs, type OrgmenvPaths } from '../../../src/utils/paths.js';

const tempDirs: string[] = [];

function makeTempDir(prefix: string): string {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  tempDirs.push(tempDir);
  return tempDir;
}

afterEach(() => {
  tempDirs.splice(0).forEach((dirPath) => {
    fs.rmSync(dirPath, { recursive: true, force: true });
  });
});

describe('ensureOrgmenvDirs', () => {
  it('removes broken symlinks before creating managed directories', () => {
    const tempDir = makeTempDir('orgmenv-paths-');
    const configDir = path.join(tempDir, 'config', 'orgmenv');
    const backupsDir = path.join(configDir, 'backups');
    const cacheDir = path.join(configDir, 'cache');
    fs.mkdirSync(configDir, { recursive: true });
    fs.symlinkSync(path.join(tempDir, 'missing-target', 'backups'), backupsDir, 'dir');
    fs.symlinkSync(path.join(tempDir, 'missing-target', 'cache'), cacheDir, 'dir');

    const paths: OrgmenvPaths = {
      configDir,
      dbPath: path.join(configDir, 'orgmenv.db'),
      backupsDir,
      cacheDir
    };

    ensureOrgmenvDirs(paths);

    expect(fs.lstatSync(backupsDir).isSymbolicLink()).toBe(false);
    expect(fs.statSync(backupsDir).isDirectory()).toBe(true);
    expect(fs.lstatSync(cacheDir).isSymbolicLink()).toBe(false);
    expect(fs.statSync(cacheDir).isDirectory()).toBe(true);
  });
});
