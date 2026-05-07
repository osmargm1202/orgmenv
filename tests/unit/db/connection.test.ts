import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { createConnection } from '../../../src/db/connection.js';

const ORIGINAL_XDG_CONFIG_HOME = process.env.XDG_CONFIG_HOME;
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

  if (ORIGINAL_XDG_CONFIG_HOME === undefined) {
    delete process.env.XDG_CONFIG_HOME;
  } else {
    process.env.XDG_CONFIG_HOME = ORIGINAL_XDG_CONFIG_HOME;
  }
});

describe('createConnection', () => {
  it('uses the custom db parent without touching the default config directory', () => {
    const tempDir = makeTempDir('orgmenv-db-');
    const defaultConfigHome = path.join(tempDir, 'default-config');
    fs.mkdirSync(defaultConfigHome, { recursive: true });
    fs.writeFileSync(path.join(defaultConfigHome, 'orgmenv'), 'not a directory');
    process.env.XDG_CONFIG_HOME = defaultConfigHome;

    const dbPath = path.join(tempDir, 'custom-db', 'nested', 'orgmenv.db');
    const db = createConnection({ dbPath });

    try {
      expect(fs.existsSync(dbPath)).toBe(true);
      expect(fs.statSync(path.dirname(dbPath)).isDirectory()).toBe(true);
    } finally {
      db.close();
    }
  });

  it('removes a broken database symlink before opening the connection', () => {
    const tempDir = makeTempDir('orgmenv-db-symlink-');
    const dbPath = path.join(tempDir, 'orgmenv.db');
    fs.symlinkSync(path.join(tempDir, 'missing-target', 'orgmenv.db'), dbPath);

    const db = createConnection({ dbPath });

    try {
      expect(db.prepare('SELECT 1 AS value').get()).toEqual({ value: 1 });
      expect(fs.lstatSync(dbPath).isSymbolicLink()).toBe(false);
      expect(fs.statSync(dbPath).isFile()).toBe(true);
    } finally {
      db.close();
    }
  });
});
