import { afterEach, describe, expect, it, vi } from 'vitest';

const { questionMock, closeMock, createInterfaceMock } = vi.hoisted(() => {
  const question = vi.fn();
  const close = vi.fn();
  const createInterface = vi.fn(() => ({
    question,
    close
  }));

  return {
    questionMock: question,
    closeMock: close,
    createInterfaceMock: createInterface
  };
});

vi.mock('node:readline/promises', () => ({
  createInterface: createInterfaceMock
}));

import { resolveProjectId } from '../../../src/commands/runtime.js';

function withTTY(value: boolean): void {
  Object.defineProperty(process.stdin, 'isTTY', { value, configurable: true });
  Object.defineProperty(process.stdout, 'isTTY', { value, configurable: true });
}

afterEach(() => {
  questionMock.mockReset();
  closeMock.mockReset();
  createInterfaceMock.mockClear();
  withTTY(false);
});

describe('resolveProjectId ambiguous interactive selection', () => {
  it('allows selecting a specific candidate interactively', async () => {
    withTTY(true);
    questionMock.mockResolvedValueOnce('2');

    const services = {
      resolver: {
        resolve: vi.fn(() => ({
          ok: false,
          error: 'AMBIGUOUS',
          candidates: [
            { projectId: 'proj-a', confidence: 100, reason: 'signal:root_path' },
            { projectId: 'proj-b', confidence: 100, reason: 'signal:git_repo_name' }
          ]
        }))
      }
    };

    const projectId = await resolveProjectId(services as any, { noconfirm: false }, true);

    expect(projectId).toBe('proj-b');
    expect(createInterfaceMock).toHaveBeenCalledOnce();
    expect(closeMock).toHaveBeenCalledOnce();
  });

  it('fails deterministically with --noconfirm on ambiguity', async () => {
    const services = {
      resolver: {
        resolve: vi.fn(() => ({
          ok: false,
          error: 'AMBIGUOUS',
          candidates: [
            { projectId: 'proj-a', confidence: 100, reason: 'signal:root_path' },
            { projectId: 'proj-b', confidence: 100, reason: 'signal:git_repo_name' }
          ]
        }))
      }
    };

    await expect(resolveProjectId(services as any, { noconfirm: true }, true)).rejects.toThrow(
      /project resolution is ambiguous/
    );
    expect(createInterfaceMock).not.toHaveBeenCalled();
  });

  it('reuses ambiguity selection flow for explicit --project collisions', async () => {
    withTTY(true);
    questionMock.mockResolvedValueOnce('1');

    const resolveMock = vi
      .fn()
      .mockImplementationOnce(() => ({ ok: false, error: 'INVALID_EXPLICIT' }))
      .mockImplementationOnce(() => ({
        ok: false,
        error: 'AMBIGUOUS',
        candidates: [
          { projectId: 'proj-a', confidence: 40, reason: 'explicit:name-or-alias' },
          { projectId: 'proj-b', confidence: 40, reason: 'explicit:name-or-alias' }
        ]
      }));

    const services = {
      resolver: {
        resolve: resolveMock
      }
    };

    const projectId = await resolveProjectId(services as any, { project: 'shared', noconfirm: false }, true);

    expect(projectId).toBe('proj-a');
    expect(resolveMock).toHaveBeenCalledTimes(2);
    expect(createInterfaceMock).toHaveBeenCalledOnce();
  });

  it('fails explicitly in non-TTY when explicit collision cannot be selected', async () => {
    withTTY(false);

    const resolveMock = vi
      .fn()
      .mockImplementationOnce(() => ({ ok: false, error: 'INVALID_EXPLICIT' }))
      .mockImplementationOnce(() => ({
        ok: false,
        error: 'AMBIGUOUS',
        candidates: [
          { projectId: 'proj-a', confidence: 40, reason: 'explicit:name-or-alias' },
          { projectId: 'proj-b', confidence: 40, reason: 'explicit:name-or-alias' }
        ]
      }));

    const services = {
      resolver: {
        resolve: resolveMock
      }
    };

    await expect(resolveProjectId(services as any, { project: 'shared', noconfirm: false }, true)).rejects.toThrow(
      /non-interactive terminal/
    );
    expect(createInterfaceMock).not.toHaveBeenCalled();
  });
});
