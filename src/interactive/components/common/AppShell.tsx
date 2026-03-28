import React from 'react';
import { Box, Text } from 'ink';

interface AppShellProps {
  appVersion: string;
  children: React.ReactNode;
}

const ORGM_BANNER_LINES: readonly string[] = [
  '  ██████╗ ██████╗  ██████╗ ███╗   ███╗',
  ' ██╔═══██╗██╔══██╗██╔════╝ ████╗ ████║',
  ' ██║   ██║██████╔╝██║  ███╗██╔████╔██║',
  ' ██║   ██║██╔══██╗██║   ██║██║╚██╔╝██║',
  ' ╚██████╔╝██║  ██║╚██████╔╝██║ ╚═╝ ██║',
  '  ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚═╝     ╚═╝'
] as const;

export function AppShell({ appVersion, children }: AppShellProps): React.JSX.Element {
  return (
    <Box flexDirection="column" paddingX={1} paddingY={1} alignItems="flex-start">
      <Box
        flexDirection="column"
        borderStyle="round"
        borderColor="magenta"
        paddingX={2}
        paddingY={1}
        minWidth={96}
      >
        <Box flexDirection="column" alignItems="flex-start">
          {ORGM_BANNER_LINES.map((line, index) => (
            <Text key={line} color="magentaBright" bold>
              {line}
            </Text>
          ))}
          <Box>
            <Text color="magentaBright" bold>
              {'                      ORGM'}
            </Text>
            <Text color="magentaBright">env</Text>
          </Box>
        </Box>

        <Text color="gray">Version {appVersion}</Text>

        <Box marginTop={1} flexDirection="column">
          {children}
        </Box>
      </Box>
    </Box>
  );
}
