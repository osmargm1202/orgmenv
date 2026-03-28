import { describe, expect, it } from 'vitest';
import { createTestRuntime } from '../helpers/testRuntime.js';

describe('integration: restore + history', () => {
  it('restore creates new latest snapshot and preserves historical versions', () => {
    const runtime = createTestRuntime();
    const project = runtime.projectRepo.create({ name: 'web-app' });

    runtime.variableService.mutate({
      projectId: project.id,
      environment: 'dev',
      operation: 'set',
      key: 'API',
      value: 'v1'
    });
    runtime.variableService.mutate({
      projectId: project.id,
      environment: 'dev',
      operation: 'set',
      key: 'API',
      value: 'v2'
    });

    const restored = runtime.versioning.restoreSnapshot({
      projectId: project.id,
      environment: 'dev',
      versionNumber: 1
    });

    expect(restored.versionNumber).toBe(3);

    const latest = runtime.versioning.getLatestSnapshot(project.id, 'dev').entries;
    expect(runtime.encryption.decryptForUse(latest[0].value)).toBe('v1');

    const env = runtime.environmentRepo.getByName(project.id, 'dev');
    expect(env).toBeDefined();
    const history = runtime.versionRepo.history(project.id, env!.id);
    expect(history.map((entry) => entry.versionNumber)).toEqual([3, 2, 1]);

    runtime.db.close();
  });

  it('fails when restoring missing version and supports empty history lookup', () => {
    const runtime = createTestRuntime();
    const project = runtime.projectRepo.create({ name: 'cli-tool' });
    const env = runtime.environmentRepo.ensure(project.id, 'dev');

    expect(runtime.versionRepo.history(project.id, env.id)).toEqual([]);

    expect(() =>
      runtime.versioning.restoreSnapshot({
        projectId: project.id,
        environment: 'dev',
        versionNumber: 99
      })
    ).toThrow('version not found: 99');

    runtime.db.close();
  });
});
