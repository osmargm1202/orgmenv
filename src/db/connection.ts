import path from 'node:path';
import Database from 'better-sqlite3';
import { ensureDirectory, ensureOrgmenvDirs, removeBrokenSymlink, resolveOrgmenvPaths } from '../utils/paths.js';

export interface DbConnectionOptions {
  dbPath?: string;
}

export function createConnection(options: DbConnectionOptions = {}): Database.Database {
  const defaultPaths = resolveOrgmenvPaths();
  const resolvedPath = options.dbPath ?? defaultPaths.dbPath;

  if (options.dbPath && resolvedPath !== ':memory:') {
    ensureDirectory(path.dirname(resolvedPath));
    removeBrokenSymlink(resolvedPath);
  } else if (!options.dbPath) {
    ensureOrgmenvDirs(defaultPaths);
    removeBrokenSymlink(resolvedPath);
  }

  const db = new Database(resolvedPath);
  db.pragma('journal_mode = WAL');
  db.pragma('synchronous = NORMAL');
  db.pragma('foreign_keys = ON');

  return db;
}
