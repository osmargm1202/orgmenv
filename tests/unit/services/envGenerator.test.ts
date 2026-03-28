import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { EnvGeneratorService } from '../../../src/services/envGenerator.js';
import type { EnvironmentRepo } from '../../../src/db/repositories/environmentRepo.js';
import type { VariableRepo } from '../../../src/db/repositories/variableRepo.js';
import type { EncryptionService } from '../../../src/services/encryption.js';

const tempDirs: string[] = [];

afterEach(() => {
  tempDirs.splice(0).forEach((dirPath) => {
    fs.rmSync(dirPath, { recursive: true, force: true });
  });
});

function buildService(): EnvGeneratorService {
  const environmentRepo = {
    getByName: () => ({ id: 'env-dev' })
  } as unknown as EnvironmentRepo;

  const variableRepo = {
    getLatestSnapshot: () => [
      { key: 'Z_KEY', value: 'z', isSecret: true, sortOrder: 2 },
      { key: 'EMPTY', value: '', isSecret: true, sortOrder: 1 },
      { key: 'A_KEY', value: 'a', isSecret: true, sortOrder: 0 }
    ]
  } as unknown as VariableRepo;

  const encryption = {
    decryptForUse: (value: string) => value
  } as unknown as EncryptionService;

  return new EnvGeneratorService(environmentRepo, variableRepo, encryption);
}

describe('EnvGeneratorService', () => {
  it('renders deterministic KEY=VALUE ordering and empty values in stdout mode', () => {
    const service = buildService();

    const result = service.generate({
      projectId: 'proj-1',
      environment: 'dev',
      mode: 'stdout'
    });

    expect(result.content).toBe(['A_KEY=a', 'EMPTY=', 'Z_KEY=z'].join('\n'));
  });

  it('renders shell exports for bash/fish and supports single key retrieval', () => {
    const service = buildService();

    const bash = service.generate(
      {
        projectId: 'proj-1',
        environment: 'dev',
        mode: 'shell-export'
      },
      'bash'
    );

    const fish = service.generate(
      {
        projectId: 'proj-1',
        environment: 'dev',
        mode: 'shell-export'
      },
      'fish'
    );

    const single = service.generate({
      projectId: 'proj-1',
      environment: 'dev',
      mode: 'single-key',
      key: 'EMPTY'
    });

    expect(bash.content).toContain('export A_KEY="a"');
    expect(fish.content).toContain('set -gx A_KEY "a";');
    expect(single.content).toBe('EMPTY=');
  });

  it('writes file output and fails for missing key in single-key mode', () => {
    const service = buildService();
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'orgmenv-envgen-'));
    tempDirs.push(tempDir);
    const outputPath = path.join(tempDir, '.env.generated');

    const fileResult = service.generate({
      projectId: 'proj-1',
      environment: 'dev',
      mode: 'file',
      outputPath
    });

    expect(fileResult.outputPath).toBe(outputPath);
    expect(fs.readFileSync(outputPath, 'utf8')).toContain('A_KEY=a');

    expect(() =>
      service.generate({
        projectId: 'proj-1',
        environment: 'dev',
        mode: 'single-key',
        key: 'NOT_FOUND'
      })
    ).toThrow('key not found: NOT_FOUND');
  });
});
