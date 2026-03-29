import React, { useState } from 'react';
import { useInput } from 'ink';
import { InputStep } from '../components/common/InputStep.js';

interface InputDemoScreenProps {
  active: boolean;
  onBack: () => void;
}

export function InputDemoScreen({ active, onBack }: InputDemoScreenProps): React.JSX.Element {
  const [value, setValue] = useState('');
  const [status, setStatus] = useState('ready to type');

  useInput(
    (input, key) => {
      if (key.escape || input.toLowerCase() === 'b') {
        onBack();
        return;
      }

      if (key.return) {
        if (value.trim().length === 0) {
          setStatus('error: value cannot be empty');
          return;
        }

        setStatus(`saved: ${value.trim()}`);
        return;
      }

      if (key.backspace || key.delete) {
        setValue((prev) => prev.slice(0, -1));
        return;
      }

      if (key.ctrl || key.meta || key.tab || key.upArrow || key.downArrow || key.leftArrow || key.rightArrow) {
        return;
      }

      setValue((prev) => prev + input);
    },
    { isActive: active }
  );

  return (
    <InputStep
      title="Step 1 · Enter a value"
      label="Project alias"
      value={value}
      defaultValue="my-project"
      hint="Type text, Enter to confirm, b/Esc to go back"
      status={status}
    />
  );
}
