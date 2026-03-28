import React from 'react';
import { render } from 'ink-testing-library';
import { describe, expect, it, vi } from 'vitest';
import { HomeScreen } from '../../src/interactive/screens/HomeScreen.js';
import { AppShell } from '../../src/interactive/components/common/AppShell.js';

describe('ui: home menu and header', () => {
  it('renders home menu actions', () => {
    const onNavigate = vi.fn();
    const onExit = vi.fn();

    const app = render(<HomeScreen active={true} onNavigate={onNavigate} onExit={onExit} />);
    const frame = app.lastFrame() ?? '';

    expect(frame).toContain('MAIN MENU');
    expect(frame).toContain('1. Generate env');
    expect(frame).toContain('2. Current project');
    expect(frame).toContain('3. Variables');
    expect(frame).toContain('4. Search');
    expect(frame).toContain('5. History / Restore');
    expect(frame).toContain('6. Register project');
    expect(frame).toContain('7. Configuration menu');
    expect(frame).toContain('8. Exit');

    app.unmount();
  });

  it('keeps home menu clean without AGE status line', () => {
    const onNavigate = vi.fn();
    const onExit = vi.fn();

    const app = render(<HomeScreen active={true} onNavigate={onNavigate} onExit={onExit} />);

    expect(app.lastFrame()).not.toContain('AGE_KEY_FILE');
    expect(onNavigate).not.toHaveBeenCalled();
    expect(onExit).not.toHaveBeenCalled();
    app.unmount();
  });

  it('renders persistent shell header with version', () => {
    const app = render(
      <AppShell appVersion="1.2.3">
        <HomeScreen active={true} onNavigate={() => undefined} onExit={() => undefined} />
      </AppShell>
    );

    const frame = app.lastFrame() ?? '';

    expect(frame).toContain('██████╗ ██████╗  ██████╗');
    expect(frame).toContain('ORGMenv');
    expect(frame).toContain('Version 1.2.3');
    expect(frame).toContain('MAIN MENU');

    const versionIndex = frame.indexOf('Version 1.2.3');
    const envIndex = frame.indexOf('ORGMenv');
    expect(versionIndex).toBeGreaterThan(envIndex);

    app.unmount();
  });
});
