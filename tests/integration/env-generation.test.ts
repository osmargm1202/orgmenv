import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { createTestRuntime } from '../helpers/testRuntime.js';

const tempDirs: string[] = [];

afterEach(() => {
  tempDirs.splice(0).forEach((dirPath) => {
    fs.rmSync(dirPath, { recursive: true, force: true });
  });
});

describe('integration: env generation output modes', () => {
  it('supports stdout/file/export/single-key with deterministic outputs', () => {
    const runtime = createTestRuntime();
    const project = runtime.projectRepo.create({ name: 'mobile-app' });

    runtime.variableService.mutate({
      projectId: project.id,
      environment: 'dev',
      operation: 'set',
      key: 'A',
      value: '1'
    });
    runtime.variableService.mutate({
      projectId: project.id,
      environment: 'dev',
      operation: 'set',
      key: 'EMPTY',
      value: ''
    });

    const stdout = runtime.envGenerator.generate({
      projectId: project.id,
      environment: 'dev',
      mode: 'stdout'
    });
    expect(stdout.content).toContain('A=1');
    expect(stdout.content).toContain('EMPTY=');

    const exportOutput = runtime.envGenerator.generate(
      {
        projectId: project.id,
        environment: 'dev',
        mode: 'shell-export'
      },
      'fish'
    );
    expect(exportOutput.content).toContain('set -gx A "1";');

    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'orgmenv-int-gen-'));
    tempDirs.push(tempDir);
    const outputPath = path.join(tempDir, '.env.out');

    const fileResult = runtime.envGenerator.generate({
      projectId: project.id,
      environment: 'dev',
      mode: 'file',
      outputPath
    });
    expect(fileResult.outputPath).toBe(outputPath);
    expect(fs.readFileSync(outputPath, 'utf8')).toContain('EMPTY=');

    const single = runtime.envGenerator.generate({
      projectId: project.id,
      environment: 'dev',
      mode: 'single-key',
      key: 'A'
    });
    expect(single.content).toBe('A=1');

    runtime.db.close();
  });
});
