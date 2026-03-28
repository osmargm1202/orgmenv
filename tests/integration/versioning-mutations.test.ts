import { describe, expect, it } from 'vitest';
import { createTestRuntime } from '../helpers/testRuntime.js';

describe('integration: versioning mutations', () => {
  it('creates N+1 snapshots for set/unset/import merge/replace with full state', () => {
    const runtime = createTestRuntime();
    const project = runtime.projectRepo.create({ name: 'api-service', alias: 'api' });

    const setA = runtime.variableService.mutate({
      projectId: project.id,
      environment: 'dev',
      operation: 'set',
      key: 'A',
      value: '1'
    });
    expect(setA.version.versionNumber).toBe(1);

    const setB = runtime.variableService.mutate({
      projectId: project.id,
      environment: 'dev',
      operation: 'set',
      key: 'B',
      value: '2'
    });
    expect(setB.version.versionNumber).toBe(2);

    const merged = runtime.variableService.mutate({
      projectId: project.id,
      environment: 'dev',
      operation: 'import',
      mergeMode: 'merge',
      importEntries: [
        { key: 'A', value: '10' },
        { key: 'C', value: '3' }
      ]
    });
    expect(merged.version.versionNumber).toBe(3);

    const latestAfterMerge = runtime.versioning.getLatestSnapshot(project.id, 'dev').entries;
    expect(latestAfterMerge.map((entry) => entry.key)).toEqual(['A', 'B', 'C']);
    expect(runtime.encryption.decryptForUse(latestAfterMerge[0].value)).toBe('10');

    const replaced = runtime.variableService.mutate({
      projectId: project.id,
      environment: 'dev',
      operation: 'import',
      mergeMode: 'replace',
      importEntries: [{ key: 'ONLY', value: 'value' }]
    });
    expect(replaced.version.versionNumber).toBe(4);

    const latestAfterReplace = runtime.versioning.getLatestSnapshot(project.id, 'dev').entries;
    expect(latestAfterReplace.map((entry) => entry.key)).toEqual(['ONLY']);

    const unsetOnly = runtime.variableService.mutate({
      projectId: project.id,
      environment: 'dev',
      operation: 'unset',
      key: 'ONLY'
    });
    expect(unsetOnly.version.versionNumber).toBe(5);
    expect(runtime.versioning.getLatestSnapshot(project.id, 'dev').entries).toHaveLength(0);

    runtime.db.close();
  });
});
