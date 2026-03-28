import { afterEach, describe, expect, it, vi } from 'vitest';

const spawnSyncMock = vi.fn();

vi.mock('node:child_process', () => ({
  spawnSync: (...args: unknown[]) => spawnSyncMock(...args)
}));

import { ToolingDiagnosticsService } from '../../../src/services/toolingDiagnostics.js';

afterEach(() => {
  spawnSyncMock.mockReset();
});

describe('ToolingDiagnosticsService', () => {
  it('reports all tools available when which exits 0', () => {
    spawnSyncMock.mockReturnValue({ status: 0 });

    const result = new ToolingDiagnosticsService().run();

    expect(result.allAvailable).toBe(true);
    expect(result.tools.every((tool) => tool.available)).toBe(true);
    expect(result.tools.every((tool) => tool.installGuidance.length === 0)).toBe(true);
    expect(result.tools.filter((tool) => tool.required).map((tool) => tool.name)).toEqual([
      'age',
      'age-keygen'
    ]);
  });

  it('returns install guidance when required tools are missing', () => {
    spawnSyncMock.mockImplementation((_: string, args?: string[]) => {
      const tool = args?.[0];
      if (tool === 'age' || tool === 'age-keygen') {
        return { status: 1 };
      }

      return { status: 0 };
    });

    const result = new ToolingDiagnosticsService().run();

    expect(result.allAvailable).toBe(false);
    expect(result.tools).toHaveLength(3);
    expect(result.tools[0].installGuidance[0]).toContain('Install age');
    expect(result.tools[1].name).toBe('sops');
    expect(result.tools[1].required).toBe(false);
    expect(result.tools[1].available).toBe(true);
  });

  it('keeps diagnostics green when only optional sops is missing', () => {
    spawnSyncMock.mockImplementation((_: string, args?: string[]) => {
      const tool = args?.[0];
      if (tool === 'sops') {
        return { status: 1 };
      }

      return { status: 0 };
    });

    const result = new ToolingDiagnosticsService().run();

    expect(result.allAvailable).toBe(true);
    const sops = result.tools.find((tool) => tool.name === 'sops');
    expect(sops).toBeDefined();
    expect(sops?.required).toBe(false);
    expect(sops?.available).toBe(false);
    expect(sops?.installGuidance[0]).toContain('Install sops');
  });
});
