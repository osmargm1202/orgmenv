import React, { useState } from 'react';
import { Box, useApp, useInput } from 'ink';
import { AppShell } from './components/common/AppShell.js';
import { HomeScreen } from './screens/HomeScreen.js';
import { InputDemoScreen } from './screens/InputDemoScreen.js';
import type { ScreenId } from './types.js';

interface InteractiveMenuProps {
  appVersion: string;
}

export function InteractiveMenu({ appVersion }: InteractiveMenuProps): React.JSX.Element {
  const { exit } = useApp();
  const [stack, setStack] = useState<ScreenId[]>(['home']);
  const current = stack[stack.length - 1];

  const navigate = (screen: ScreenId) => {
    setStack((prev) => [...prev, screen]);
  };

  const goBack = () => {
    setStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  };

  useInput((input, key) => {
    if (key.ctrl && input.toLowerCase() === 'c') {
      exit();
    }
  });

  return (
    <Box flexDirection="column">
      <AppShell appVersion={appVersion}>
        {current === 'home' ? (
          <HomeScreen active={true} onStartInputDemo={() => navigate('input-demo')} onExit={() => exit()} />
        ) : null}

        {current === 'input-demo' ? <InputDemoScreen active={true} onBack={goBack} /> : null}
      </AppShell>
    </Box>
  );
}
