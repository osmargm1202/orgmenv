import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createProgram } from '../src/cli.js';
import { appVersion } from '../src/version.js';

interface PackageJsonLike {
  version?: string;
}

function getExpectedVersion(): string {
  const candidates = [new URL('../package.json', import.meta.url), new URL('../package.template.json', import.meta.url)];

  for (const candidate of candidates) {
    if (!existsSync(candidate)) {
      continue;
    }

    const content = readFileSync(candidate, 'utf8');
    const parsed = JSON.parse(content) as PackageJsonLike;

    if (parsed.version) {
      return parsed.version;
    }
  }

  throw new Error('No se pudo resolver version esperada desde package.json/package.template.json');
}

describe('version wiring', () => {
  it('uses package version for appVersion', () => {
    expect(appVersion).toBe(getExpectedVersion());
    expect(appVersion).not.toBe('0.0.0');
  });

  it('uses package version for --version output', () => {
    const program = createProgram();
    expect(program.version()).toBe(appVersion);
  });
});
