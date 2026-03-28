import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import React from 'react';
import { render } from 'ink-testing-library';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LocalConfigScreen } from '../../src/interactive/screens/LocalConfigScreen.js';
import type { RuntimeServices } from '../../src/commands/runtime.js';

const ORIGINAL_AGE_KEY_FILE = process.env.AGE_KEY_FILE;

function createRuntimeStub(keyPath?: string): RuntimeServices {
  return {
    config: {
      dbPath: ':memory:',
      useEncryption: true,
      keyPath
    },
    encryption: {
      resolveKeySource: () => ({ source: 'none' as const })
    },
    diagnostics: {
      run: () => ({ allAvailable: true, tools: [] })
    }
  } as unknown as RuntimeServices;
}

describe.sequential('ui: local config key management visibility', () => {
  let tempDir = '';

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'orgmenv-local-config-'));
    delete process.env.AGE_KEY_FILE;
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
    if (ORIGINAL_AGE_KEY_FILE === undefined) {
      delete process.env.AGE_KEY_FILE;
    } else {
      process.env.AGE_KEY_FILE = ORIGINAL_AGE_KEY_FILE;
    }
  });

  it('hides key-management options when AGE_KEY_FILE points to an existing key', () => {
    const keyPath = path.join(tempDir, 'age.txt');
    fs.writeFileSync(keyPath, 'AGE-SECRET-KEY-1VISIBLE');
    process.env.AGE_KEY_FILE = keyPath;

    const app = render(
      <LocalConfigScreen
        active={true}
        runtime={createRuntimeStub()}
        options={{}}
        environment="dev"
        projectState={{ note: 'test' }}
        onBack={vi.fn()}
        onProjectStateChange={vi.fn()}
      />
    );

    const frame = app.lastFrame();
    expect(frame).not.toContain('Set fallback key path');
    expect(frame).not.toContain('Clear fallback key path');
    expect(frame).not.toContain('Generate age key file');

    app.unmount();
  });

  it('shows key-management options when AGE_KEY_FILE is missing', () => {
    process.env.AGE_KEY_FILE = path.join(tempDir, 'missing-age.txt');

    const app = render(
      <LocalConfigScreen
        active={true}
        runtime={createRuntimeStub()}
        options={{}}
        environment="dev"
        projectState={{ note: 'test' }}
        onBack={vi.fn()}
        onProjectStateChange={vi.fn()}
      />
    );

    const frame = app.lastFrame();
    expect(frame).toContain('Set fallback key path');
    expect(frame).toContain('Clear fallback key path');
    expect(frame).toContain('Generate age key file');

    app.unmount();
  });
});
