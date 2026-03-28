import { describe, expect, it, vi } from 'vitest';
import { createProgram } from '../../../src/cli.js';
import { readInstructionsText, resolveInstructionsDocPath } from '../../../src/commands/instructions.js';

describe('instructions command', () => {
  it('resolves local docs path from package files', () => {
    const docsPath = resolveInstructionsDocPath();

    expect(docsPath).toBeDefined();
    expect(docsPath).toMatch(/docs\/INSTRUCTIONS\.md$/);
  });

  it('reads non-empty instructions content', () => {
    const content = readInstructionsText();

    expect(content.length).toBeGreaterThan(20);
    expect(content).toContain('orgmenv instructions');
  });

  it('prints extended instructions via CLI command', async () => {
    const program = createProgram();
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);

    await program.parseAsync(['node', 'orgmenv', 'instructions']);

    expect(logSpy).toHaveBeenCalledOnce();
    expect(logSpy.mock.calls[0]?.[0]).toContain('Flujo recomendado por proyecto');
    logSpy.mockRestore();
  });
});
