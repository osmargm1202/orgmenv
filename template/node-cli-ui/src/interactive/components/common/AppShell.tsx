import React from 'react';
import { Box, Text } from 'ink';
import { ASCII_BANNER_LINES, PRODUCT_PREFIX, PRODUCT_SUFFIX } from '../../branding.js';
import { PRIMARY_THEME_COLOR } from '../../theme.js';

interface AppShellProps {
  appVersion: string;
  children: React.ReactNode;
}

export function AppShell({ appVersion, children }: AppShellProps): React.JSX.Element {
  return (
    <Box flexDirection="column" paddingX={1} paddingY={1} alignItems="flex-start">
      <Box
        flexDirection="column"
        borderStyle="round"
        borderColor={PRIMARY_THEME_COLOR}
        paddingX={2}
        paddingY={1}
        minWidth={96}
      >
        <Box flexDirection="column" alignItems="flex-start">
          {ASCII_BANNER_LINES.map((line) => (
            <Text key={line} color={PRIMARY_THEME_COLOR} bold>
              {line}
            </Text>
          ))}

          <Box>
            <Text color={PRIMARY_THEME_COLOR} bold>
              {PRODUCT_PREFIX}
            </Text>
            <Text color={PRIMARY_THEME_COLOR}>{PRODUCT_SUFFIX}</Text>
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
