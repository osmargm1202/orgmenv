import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const APP_DIR_NAME = 'orgmenv';

export interface OrgmenvPaths {
  configDir: string;
  dbPath: string;
  backupsDir: string;
  cacheDir: string;
}

export function resolveOrgmenvPaths(): OrgmenvPaths {
  const configHome = process.env.XDG_CONFIG_HOME ?? path.join(os.homedir(), '.config');
  const configDir = path.join(configHome, APP_DIR_NAME);

  return {
    configDir,
    dbPath: path.join(configDir, 'orgmenv.db'),
    backupsDir: path.join(configDir, 'backups'),
    cacheDir: path.join(configDir, 'cache')
  };
}

function getErrorCode(error: unknown): string | undefined {
  return typeof error === 'object' && error !== null && 'code' in error
    ? String((error as NodeJS.ErrnoException).code)
    : undefined;
}

export function removeBrokenSymlink(targetPath: string): void {
  try {
    const stats = fs.lstatSync(targetPath);
    if (!stats.isSymbolicLink()) {
      return;
    }

    try {
      fs.statSync(targetPath);
    } catch (error) {
      if (getErrorCode(error) === 'ENOENT') {
        fs.unlinkSync(targetPath);
      } else {
        throw error;
      }
    }
  } catch (error) {
    if (getErrorCode(error) !== 'ENOENT') {
      throw error;
    }
  }
}

export function ensureDirectory(dirPath: string): void {
  removeBrokenSymlink(dirPath);
  fs.mkdirSync(dirPath, { recursive: true, mode: 0o700 });
}

export function ensureOrgmenvDirs(paths: OrgmenvPaths = resolveOrgmenvPaths()): OrgmenvPaths {
  ensureDirectory(paths.configDir);
  ensureDirectory(paths.backupsDir);
  ensureDirectory(paths.cacheDir);

  return paths;
}

export function resolveKeyPath(configKeyPath?: string): string | undefined {
  const fromEnv = process.env.AGE_KEY_FILE;
  if (fromEnv && fromEnv.trim()) {
    return fromEnv;
  }

  if (configKeyPath && configKeyPath.trim()) {
    return configKeyPath;
  }

  return undefined;
}
