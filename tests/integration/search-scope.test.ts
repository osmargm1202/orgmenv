import { describe, expect, it } from 'vitest';
import { createTestRuntime } from '../helpers/testRuntime.js';

describe('integration: mixed scope search', () => {
  it('returns both project-scoped and global scoped matches with metadata', () => {
    const runtime = createTestRuntime();
    const project = runtime.projectRepo.create({ name: 'backend', alias: 'api' });

    runtime.variableService.mutate({
      projectId: project.id,
      environment: 'dev',
      operation: 'set',
      key: 'OPENAI_API_KEY',
      value: 'project-secret'
    });

    runtime.globalVariableService.upsert({
      alias: 'shared',
      key: 'OPENAI_API_KEY',
      value: 'global-secret'
    });

    const result = runtime.globalVariableService.search('OPENAI_API_KEY');

    expect(result.values.some((value) => value.scope === 'project')).toBe(true);
    expect(result.values.some((value) => value.scope === 'global')).toBe(true);
    expect(result.values.find((value) => value.scope === 'global')?.alias).toBe('shared');
    expect(result.values.find((value) => value.scope === 'project')?.value).toBe('project-secret');
    expect(result.values.find((value) => value.scope === 'global')?.value).toBe('global-secret');

    runtime.db.close();
  });
});
