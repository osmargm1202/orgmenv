import React from 'react';
import { Box, Text } from 'ink';

interface InputStepProps {
  title: string;
  label: string;
  value: string;
  defaultValue: string;
  hint?: string;
  status?: string;
}

function renderDisplayValue(value: string): string {
  return value.length > 0 ? value : '(empty)';
}

export function InputStep({ title, label, value, defaultValue, hint, status }: InputStepProps): React.JSX.Element {
  const statusColor: 'greenBright' | 'redBright' = status?.startsWith('error:') ? 'redBright' : 'greenBright';

  return (
    <Box flexDirection="column">
      <Text color="cyanBright" bold>
        {title}
      </Text>
      <Text color="gray">Enter confirm · Esc cancel</Text>
      {status ? <Text color={statusColor}>status: {status}</Text> : null}

      <Box marginTop={1} flexDirection="column">
        <Text color="gray">INPUT</Text>
        <Text>{label}</Text>
        <Text color="gray">default: {renderDisplayValue(defaultValue)}</Text>
        <Text color="magentaBright">{value}█</Text>
      </Box>

      {hint ? (
        <Box marginTop={1}>
          <Text color="gray">{hint}</Text>
        </Box>
      ) : null}
    </Box>
  );
}
