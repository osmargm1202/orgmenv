import React from 'react';
import { render } from 'ink';
import { InteractiveMenu } from './interactive/menu.js';
import { appVersion } from './version.js';

function App(): React.JSX.Element {
  return <InteractiveMenu appVersion={appVersion} />;
}

export async function launchInteractiveApp(): Promise<void> {
  const ink = render(<App />, {
    exitOnCtrlC: false
  });

  await ink.waitUntilExit();
}
