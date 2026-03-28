import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const launchInteractiveApp = vi.fn(async () => undefined);

vi.mock('../../src/app', () => ({
  launchInteractiveApp
}));

describe('integration: CLI runtime', () => {
  let originalCwd = '';
  let tempDir = '';

  beforeEach(() => {
    originalCwd = process.cwd();
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'orgmenv-cli-'));
    process.chdir(tempDir);
    launchInteractiveApp.mockClear();
  });

  afterEach(() => {
    process.chdir(originalCwd);
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('launches interactive mode when no subcommand is provided', async () => {
    const { run } = await import('../../src/cli.js');

    await run(['node', 'orgmenv', '--project=proj-1', '--env=staging', '--noconfirm']);

    expect(launchInteractiveApp).toHaveBeenCalledWith(
      expect.objectContaining({
        project: 'proj-1',
        env: 'staging',
        noconfirm: true
      })
    );
  });

  it('exposes discoverable root help and noconfirm option contract', async () => {
    const { createProgram, parseInteractiveOptions } = await import('../../src/cli.js');

    const program = createProgram();
    const help = program.helpInformation();
    expect(help).toContain('orgmenv');
    expect(help).toContain('init');
    expect(help).toContain('gen');
    expect(help).toContain('instructions');
    expect(help).toContain('--noconfirm');

    const genHelp = program.commands
      .find((command: { name(): string; helpInformation(): string }) => command.name() === 'gen')
      ?.helpInformation();
    expect(genHelp).toContain('--output <path>');
    expect(genHelp).toContain('--export');
    expect(genHelp).toContain('--key <name>');

    expect(parseInteractiveOptions(['--noconfirm', '--env', 'prod'])).toEqual(
      expect.objectContaining({ noconfirm: true, env: 'prod' })
    );
  });

  it('does not launch interactive mode when subcommand is present', async () => {
    const { run } = await import('../../src/cli.js');
    const dbPath = path.join(tempDir, 'test.db');
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);

    await run(['node', 'orgmenv', '--db-path', dbPath, 'projects']);

    expect(launchInteractiveApp).not.toHaveBeenCalled();
    logSpy.mockRestore();
  });
});
