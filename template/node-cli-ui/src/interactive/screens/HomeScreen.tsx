import React, { useMemo, useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { OptionList, type OptionItem } from '../components/common/OptionList.js';
import { PRIMARY_THEME_COLOR } from '../theme.js';

interface HomeScreenProps {
  active: boolean;
  onStartInputDemo: () => void;
  onExit: () => void;
}

const ACTIONS: OptionItem[] = [
  { id: 'start', keyHint: '1', label: 'Open input-step flow', tone: 'safe' },
  { id: 'exit', keyHint: '2', label: 'Exit', tone: 'danger' }
];

export function HomeScreen({ active, onStartInputDemo, onExit }: HomeScreenProps): React.JSX.Element {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedAction = useMemo(() => ACTIONS[selectedIndex], [selectedIndex]);
  const totalItems = ACTIONS.length;

  const runAction = (actionId: string) => {
    if (actionId === 'start') {
      onStartInputDemo();
      return;
    }

    if (actionId === 'exit') {
      onExit();
    }
  };

  useInput(
    (input, key) => {
      const numeric = ACTIONS.find((item) => item.keyHint === input);
      if (numeric) {
        runAction(numeric.id);
        return;
      }

      if (key.downArrow) {
        setSelectedIndex((prev) => (prev + 1) % totalItems);
        return;
      }

      if (key.upArrow) {
        setSelectedIndex((prev) => (prev - 1 + totalItems) % totalItems);
        return;
      }

      if (key.return && selectedAction) {
        runAction(selectedAction.id);
      }
    },
    { isActive: active }
  );

  return (
    <Box flexDirection="column">
      <Text color={PRIMARY_THEME_COLOR} bold>
        Main menu
      </Text>
      <Text color="gray">↑/↓ move · Enter confirm · 1-2 quick select</Text>
      <Text color="greenBright">status: ready</Text>

      <Box marginTop={1} flexDirection="column">
        <Text color="gray">ACTIONS</Text>
        <OptionList items={ACTIONS} selectedIndex={selectedIndex} />
      </Box>
    </Box>
  );
}
