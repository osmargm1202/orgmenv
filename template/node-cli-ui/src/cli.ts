#!/usr/bin/env node
import { realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Command } from 'commander';
import { launchInteractiveApp } from './app.js';
import { APP_BIN_NAME, APP_DESCRIPTION } from './interactive/branding.js';
import { appVersion } from './version.js';

export function createProgram(): Command {
  const program = new Command();
  program
    .name(APP_BIN_NAME)
    .description(APP_DESCRIPTION)
    .version(appVersion)
    .showHelpAfterError();

  return program;
}

export async function run(argv: string[] = process.argv): Promise<void> {
  const program = createProgram();
  const rawArgs = argv.slice(2);
  const asksHelpOrVersion = rawArgs.some((arg) => ['--help', '-h', '--version', '-V'].includes(arg));

  if (!asksHelpOrVersion) {
    await launchInteractiveApp();
    return;
  }

  await program.parseAsync(argv);
}

function isExecutedAsMain(): boolean {
  const argvEntry = process.argv[1];
  if (!argvEntry) {
    return false;
  }

  const modulePath = fileURLToPath(import.meta.url);

  try {
    return realpathSync(modulePath) === realpathSync(argvEntry);
  } catch {
    return modulePath === argvEntry;
  }
}

if (isExecutedAsMain()) {
  run().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`error: ${message}`);
    process.exitCode = 1;
  });
}
