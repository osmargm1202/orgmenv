import { existsSync, readFileSync } from 'node:fs';

interface PackageJsonLike {
  version?: string;
}

function getCandidatePackageJsonPaths(): URL[] {
  return [
    new URL('../package.json', import.meta.url),
    new URL('../package.template.json', import.meta.url),
    new URL('../../package.json', import.meta.url),
    new URL('../../package.template.json', import.meta.url)
  ];
}

function readVersionFromPackageJson(path: URL): string | null {
  if (!existsSync(path)) {
    return null;
  }

  const content = readFileSync(path, 'utf8');
  const parsed = JSON.parse(content) as PackageJsonLike;
  return parsed.version ?? null;
}

function resolveAppVersion(): string {
  for (const candidatePath of getCandidatePackageJsonPaths()) {
    const version = readVersionFromPackageJson(candidatePath);
    if (version) {
      return version;
    }
  }

  return '0.0.0';
}

export const appVersion = resolveAppVersion();
